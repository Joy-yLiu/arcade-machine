import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class ControlledPoint {
  constructor(x, y, z) {
    this.pos = vec3(x ?? 0, y ?? 0, z ?? 0);
    this.vel = vec3(0, 0, 0);
    this.max = vec3(3, 9.8, 3);
    this.min = vec3(-3, 7,-3);
  }

  step = (stepSize) => {
    if (this.vel[0] == 0 && this.vel[1] == 0 && this.vel[2] == 0) return;
    const v = this.vel.normalized();

    let newpos = this.pos.plus(v.times(stepSize));
    for(let i = 0; i < 3; i++) {
      if (newpos[i] > this.max[i] || newpos[i] < this.min[i]) {
        newpos[i] = this.pos[i];
      }
    }
    this.pos = newpos;
    //this.pos.add_by(v.times(stepSize));
  }

  upStart = () => { this.vel[1] = 1; }
  upEnd = () => { this.vel[1] = 0; }
  downStart = () => { this.vel[1] = -1; }
  downEnd = () => { this.vel[1] = 0; }
  leftStart = () => { this.vel[0] = -1; }
  leftEnd = () => { this.vel[0] = 0; }
  rightStart = () => { this.vel[0] = 1; }
  rightEnd = () => { this.vel[0] = 0; }
  inStart = () => { this.vel[2] = -1; }
  inEnd = () => { this.vel[2] = 0; }
  outStart = () => { this.vel[2] = 1; }
  outEnd = () => { this.vel[2] = 0; }

}
