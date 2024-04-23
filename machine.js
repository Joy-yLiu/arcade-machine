import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'sphere': new defs.Subdivision_Sphere( 5 ),
    'cube': new defs.Cube( 5 ),
};

export
const Articulated_Machine =
    class Articulated_Machine {
        constructor() {
            const cube_shape = shapes.cube;

            // Base node
            const base_transform = Mat4.scale(2, 0.7, 2);
            this.base_node = new Node("base", cube_shape, base_transform);
            // root->base
            const root_location = Mat4.translation(0, 11, 0);
            this.root = new Arc("root", null, this.base_node, root_location);

            // Upper arm node
            let upper_arm_transform = Mat4.scale(.2, 0.8, .2);
            upper_arm_transform.pre_multiply(Mat4.translation(0, -0.2, 0));
            this.upper_arm_node = new Node("upper_arm", cube_shape, upper_arm_transform);
            // base->arc_1->upper_arm
            const arc_1_location = Mat4.translation(0, -0.8, 0);
            this.arc_1 = new Arc("arc_1", this.base_node, this.upper_arm_node,arc_1_location);
            this.base_node.children_arcs.push(this.arc_1);
            this.arc_1.set_dof(false, false, true, true); // set dof

            // Lower arm node
            let lower_arm_transform = Mat4.scale(.16, 0.6, .16);
            lower_arm_transform.pre_multiply(Mat4.translation(0, -0.4, 0));
            this.lower_arm_node = new Node("lower_arm", cube_shape, lower_arm_transform);
            // base->arc_1->upper_arm
            const arc_2_location = Mat4.translation(0, -1.2, 0);
            this.arc_2 = new Arc("arc_2", this.upper_arm_node, this.lower_arm_node, arc_2_location);
            this.upper_arm_node.children_arcs.push(this.arc_2);
            this.arc_2.set_dof(false, false, true, true); // set dof

            // add the end-effector
            const claw_end_local_pos = vec4(0, -0.8, 0, 1);
            this.end_effector = new End_Effector("chain", this.arc_2, claw_end_local_pos);
            this.arc_2.end_effector = this.end_effector;

            // set dof
            this.dof = 4;
            this.Jacobian = null;
            this.theta = [0, 0, 0, 0];
            this.apply_theta();

        }

        // mapping from global theta to each joint theta
        apply_theta() {
            this.arc_1.update_articulation(this.theta.slice(0, 2));
            this.arc_2.update_articulation(this.theta.slice(2, 4));
        }

        calculate_Jacobian() {
            let J = new Array(3);
            for (let i = 0; i < 3; i++) {
                J[i] = new Array(this.dof);
            }

            const orig_theta = this.theta;
            const p = this.get_end_effector_position();

            for (let j = 0; j < this.dof; j++) {
                let d_theta = [0, 0, 0, 0];
                d_theta[j] = 0.1;
                this.theta = math.add(orig_theta, d_theta);
                //console.log("new_theta " + j + " " + this.theta);
                this.apply_theta();
                let new_p = this.get_end_effector_position();
                //console.log("new_p " + j + " " + new_p);

                J[0][j] = (new_p[0] - p[0]) / 0.1;
                J[1][j] = (new_p[1] - p[1]) / 0.1;
                J[2][j] = (new_p[2] - p[2]) / 0.1;

                this.theta = orig_theta;
            }

            return J;
        }

        calculate_delta_theta(J, dx) {
            let A = math.multiply(math.transpose(J), J);
            let I = math.identity(4)._data;
            A = math.add(A, math.multiply(I, 1));
            //console.log(A);

            let b = math.multiply(math.transpose(J), dx);
            //console.log(b);

            let x = math.lusolve(A, b)
            //console.log("x " + x);

            return x;
        }

        get_end_effector_position() {
            // in this example, we only have one end effector.
            this.matrix_stack = [];
            this._rec_update(this.root, Mat4.identity());
            const v = this.end_effector.global_position; // vec4
            return vec3(v[0], v[1], v[2]);
        }

        _rec_update(arc, matrix) {
            if (arc !== null) {
                const L = arc.location_matrix;
                const A = arc.articulation_matrix;
                matrix.post_multiply(L.times(A));
                this.matrix_stack.push(matrix.copy());

                if (arc.end_effector !== null) {
                    arc.end_effector.global_position = matrix.times(arc.end_effector.local_position);
                }

                const node = arc.child_node;
                const T = node.transform_matrix;
                matrix.post_multiply(T);

                matrix = this.matrix_stack.pop();
                for (const next_arc of node.children_arcs) {
                    this.matrix_stack.push(matrix.copy());
                    this._rec_update(next_arc, matrix);
                    matrix = this.matrix_stack.pop();
                }
            }
        }

        draw(webgl_manager, uniforms, material) {
            this.matrix_stack = [];
            this._rec_draw(this.root, Mat4.identity(), webgl_manager, uniforms, material);
        }

        _rec_draw(arc, matrix, webgl_manager, uniforms, material) {
            if (arc !== null) {
                const L = arc.location_matrix;
                const A = arc.articulation_matrix;
                matrix.post_multiply(L.times(A));
                this.matrix_stack.push(matrix.copy());

                const node = arc.child_node;
                const T = node.transform_matrix;
                matrix.post_multiply(T);
                node.shape.draw(webgl_manager, uniforms, matrix, material);

                matrix = this.matrix_stack.pop();
                for (const next_arc of node.children_arcs) {
                    this.matrix_stack.push(matrix.copy());
                    this._rec_draw(next_arc, matrix, webgl_manager, uniforms, material);
                    matrix = this.matrix_stack.pop();
                }
            }
        }
    }

class Node {
    constructor(name, shape, transform) {
        this.name = name;
        this.shape = shape;
        this.transform_matrix = transform;
        this.children_arcs = [];
    }
}

class Arc {
    constructor(name, parent, child, location) {
        this.name = name;
        this.parent_node = parent;
        this.child_node = child;
        this.location_matrix = location;
        this.articulation_matrix = Mat4.identity();
        this.end_effector = null;
        this.dof = {
            Tx: false,
            Tz: false,
            Rx: false,
            Rz: false,
        }
    }

    set_dof(tx, tz, rx, rz) {
        // translational dof
        this.dof.Tx = tx;
        this.dof.Tz = tz;

        // rotational dof
        this.dof.Rx = rx;
        this.dof.Rz = rz;
    }

    update_articulation(theta) {
        this.articulation_matrix = Mat4.identity();
        let index = 0;
        if (this.dof.Tx) {
            this.articulation_matrix.pre_multiply(Mat4.translation(theta[index], 0, 0));
            index += 1;
        }
        if (this.dof.Tz) {
            this.articulation_matrix.pre_multiply(Mat4.translation(0, 0, theta[index]));
        }
        if (this.dof.Rx) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 1, 0, 0));
            index += 1;
        }
        if (this.dof.Rz) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 0, 1));
            index += 1;
        }
        if (this.dof.Ty) {
            this.articulation_matrix.pre_multiply(Mat4.translation(0, theta[index], 0));
        }
    }
}

class End_Effector {
    constructor(name, parent, local_position) {
        this.name = name;
        this.parent = parent;
        this.local_position = local_position;
        this.global_position = null;
    }
}