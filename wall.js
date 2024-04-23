import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

// A floor, given by a transformed cube that pushes points outwards
export default class Wall {
  constructor(cubeTransform, ks, kd, mu, color) {
    cubeTransform = cubeTransform ?? Mat4.identity();
    // wall locations
    this.top = cubeTransform.times(vec4(0, 1, 0, 1))[1];
    this.bottom = cubeTransform.times(vec4(0, -1, 0, 1))[1];
    this.left = cubeTransform.times(vec4(-1, 0, 0, 1))[0];
    this.right = cubeTransform.times(vec4(1, 0, 0, 1))[0];
    this.forward = cubeTransform.times(vec4(0, 0, -1, 1))[2];
    this.back = cubeTransform?.times(vec4(0, 0, 1, 1))[2];
    // collision constants
    this.ks = ks ?? 1.0;
    this.kd = kd ?? 1.0;
    this.mu = mu ?? 1.0;
    this.color = color ?? vec4(1, 1, 1, 1);
  }

  collidesWith = (particle) => {
    const dx = Math.min(this.right, particle.pos[0]) - Math.max(this.left, particle.pos[0]);
    const dy = Math.min(this.top, particle.pos[1]) - Math.max(this.bottom, particle.pos[1]);
    const dz = Math.min(this.back, particle.pos[2]) - Math.max(this.forward, particle.pos[2]);
    return dx*dx + dy*dy + dz*dz < particle.radius*particle.radius;
  }

  forceOn = (particle) => {
    const p = particle.pos;
    const dx = p[0] > this.right ? p[0] - this.right : p[0] < this.left ? p[0] - this.left : 0;
    const dy = p[1] > this.top ? p[1] - this.top : p[1] < this.bottom ? p[1] - this.bottom : 0;
    const dz = p[2] > this.back ? p[2] - this.back : p[2] < this.forward ? p[2] - this.forward : 0;
    // const dx = Math.max(this.left, particle.pos[0]) - Math.min(this.right, particle.pos[0]);
    // const dy = Math.max(this.bottom, particle.pos[1]) - Math.min(this.top, particle.pos[1]);
    // const dz = Math.max(this.forward, particle.pos[2]) - Math.min(this.back, particle.pos[2]);
    const normal = vec4(dx, dy, dz, 0);
    if (dx == 0 && dy == 0 && dz == 0) {
      normal[1] = 0.001; // if poing fully inside, go up. Also mainly to prevent div by 0 in next step
    }
    const depth = particle.radius - normal.norm();
    const v_tangent = normal.normalized().times(particle.velocity.dot(normal.normalized()));
    const v_perp = particle.velocity.to4(false).minus(v_tangent);
    const f_s = normal.times(this.ks);
    const f_d = v_tangent.times(this.kd);
    const normalForce = f_s.plus(f_d);
    if (v_perp.norm() != 0) {
      const f_f = v_perp.normalized().times(-this.mu * normalForce.norm());
      return normalForce.plus(f_f);
    } else {
      return normalForce;
    }
  }
}