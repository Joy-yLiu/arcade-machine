import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export default class Spring {
    constructor() {
        this.particle_1 = 0;
        this.particle_2 = 0;
        this.ks = 0;
        this.kd = 0;
        this.len = 0;
        // for (let i = 0; i < size; i++) {
        //     this.pindex.push(vec(0,0));
        //     this.ks.push(0.0);
        //     this.kd.push(0.0);
        //     this.length_.push(0.0);
        // }
    }

};

