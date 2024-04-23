import {defs, tiny} from './examples/common.js';
import Particle from "./particle.js";
import Spring from "./spring.js";
import Wall from "./wall.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export default class Particle_System {
    constructor() {
        this.particles = [];
        this.springs = [];
        this.walls = [];
        this.g_acc = vec3(0,0,0);
        this.g_ks = 0;
        this.g_kd = 0;
        this.ka = 0.1;
        this.test = vec3(0,0,0);
    }

    create_particles(num_particles) {
        for (let i = 0; i < num_particles; i++) {
            let new_particle = new Particle;
            this.particles.push(new_particle);
        }
    }

    create_springs(num_springs) {
        for (let i = 0; i < num_springs; i++) {
            let new_spring = new Spring();
            this.springs.push(new_spring);
        }
    }

    create_walls(num_walls) {
        for (let i = 0; i < num_walls; i++) {
            let new_wall = new Wall();
            this.walls.push(new_wall);
        }
    }

    set_particles(index, mass, x,y,z,vx,vy,vz, r, color) {
        this.particles[index].set_particle(mass, x,y,z,vx,vy,vz, r, color);
    }

    set_wall(index, transform, ks, kd, mu, color) {
        this.walls[index] = new Wall(transform, ks, kd, mu, color);
    }

    // sets the velocity of all particles
    set_velocity(vx,vy,vz) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].set_velocity(vx,vy,vz);
        }
    }

    set_ground (ks, kd) {
        this.g_kd = kd;
        this.g_ks = ks;
    }

    set_gravity (g) {
        this.g_acc = vec3(0, -1 * g, 0);
    }

    set_air_resistance (ka) {
        this.ka = ka;
    }

    link (sindex, pindex1, pindex2, ks, kd, length) {
        this.springs[sindex].particle_1 = pindex1;
        this.springs[sindex].particle_2 = pindex2;
        this.springs[sindex].ks = ks;
        this.springs[sindex].kd = kd;
        this.springs[sindex].len = length;
    }

    update_particles(t_step, integration_method) {
        // Force of gravity and air resistance
        for (let particle of this.particles) {
            // gravity
            particle.forces = this.g_acc.times(particle.mass);
            // add air resistance proportional to velocity in the opposite direction
            let v = particle.velocity;
            particle.forces.subtract_by(v.times(this.ka * particle.mass));
        }

        // Force of particle on particle collisions
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i+1; j < this.particles.length; j++) {
                let p1 = this.particles[i];
                let p2 = this.particles[j];
                let dx = p1.pos.minus(p2.pos);
                let dv = p1.velocity.minus(p2.velocity);
                let margin = dx.norm() - p1.radius - p2.radius;
                if (margin < 0) {
                    let n = dx.normalized();
                    let f_s = n.times(this.g_ks * dx.norm() * 0.1);
                    let f_d = n.times(this.g_kd * dv.dot(n));
                    this.particles[i].forces.add_by(f_s.plus(f_d));
                    this.particles[j].forces.subtract_by(f_s.plus(f_d));
                }
            }
        }

        // Force of each spring-damper
        for (let spring of this.springs) {
            let particle_1 = this.particles[spring.particle_1];
            let particle_2 = this.particles[spring.particle_2];
            let ks = spring.ks;
            let kd = spring.kd;
            let l = spring.len;

            let pos2 = particle_2.pos;
            let pos1 = particle_1.pos;

            let d = pos2.minus(pos1);
            let d_hat = d.times(1 / d.norm());
            let v = particle_2.velocity.minus(particle_1.velocity);

            let f_s = d_hat.times(ks * (d.norm() - l));
            let f_d = d_hat.times(v.dot(d_hat)).times(kd);
            let f_f = v.minus(d_hat.times(v.dot(d_hat))).times(0.1); // "friction" perpendicular to d and opposite v

            particle_1.forces.add_by(f_s.plus(f_d).plus(f_f));
            particle_2.forces.subtract_by(f_s.plus(f_d).plus(f_f));
        }
        this.test = this.particles[0].forces;

        // Force of particle on wall collisions
        for (let particle of this.particles) {
            let orig_pos = particle.pos.copy();
            let orig_vel = particle.velocity.copy();
            
            // make a small step
            let m = particle.mass;
            let a = particle.forces.times(1 / m);
            particle.velocity.add_by(a.times(t_step));
            particle.pos.add_by(particle.velocity.times(t_step));
            
            for (let wall of this.walls) {
                if (wall.collidesWith(particle)) {
                    particle.forces.add_by(wall.forceOn(particle));
                }
            }

            particle.pos = orig_pos;
            particle.velocity = orig_vel;
        }

        // Update position and velocity of each particle according to net force
        for (let particle of this.particles) {
            let m = particle.mass;
            let a = particle.forces.times(1 / m);
            let v = particle.velocity

            let vel = vec3(0,0,0);
            let x = vec3(0,0,0);

            if (integration_method === "euler") { // Forward Euler
                vel = v.plus(a.times(t_step));
                x = particle.pos.plus(v.times(t_step))
            }
            else if (integration_method === "symplectic") { // Symplectic Euler
                vel = v.plus(a.times(t_step));
                x = particle.pos.plus(vel.times(t_step));
            }
            else if (integration_method === "verlet") { // Velocity Verlet
                vel = v.plus(a.times(t_step));
                x = particle.pos.plus(v.times(t_step)).plus(a.times(Math.pow(t_step,2) / 2));
            }
            particle.pos = x;
            particle.velocity = vel;
        }

    }

};
