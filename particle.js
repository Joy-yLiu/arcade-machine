import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export default class Particle {
    constructor() {
        this.pos = vec3(0,0,0);
        this.velocity = vec3(0,0,0);
        this.mass = 0;
        this.forces = vec3(0,0,0);
        this.radius = 0.1;
        this.color = vec4(1, 0, 0, 1);
    }

    set_particle(mass, x,y,z,vx,vy,vz, r, color) {
        this.pos = vec3(x,y,z);
        this.velocity = vec3(vx,vy,vz);
        this.mass = mass;
        this.radius = r;
        this.color = color
    }

    // sets the velocity of all particles
    set_velocity(vx,vy,vz) {
        this.velocity = vec3(vx,vy,vz);
    }

};

