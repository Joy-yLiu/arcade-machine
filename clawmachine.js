import {tiny, defs} from './examples/common.js';
import {Articulated_Machine} from "./machine.js";
import Particle_System from "./particle_system.js";
//import {Spline} from "./spline.js";
import {ControlledPoint} from "./controlled-point.js";
import {Text_Line} from './examples/text-demo.js';
import * as partOne from './spline.js';


const {Cube, Axis_Arrows, Textured_Phong} = defs


const {
  Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

// Pull these names into this module's scope for convenience:
const { Texture, Component } = tiny;

// TODO: implement the required classes here or in another file.

// draws a spline line
class Curve_Shape extends Shape {
  constructor(sp, sample_count, curve_color= color(1,1,1,1)) {
    super("position", "normal");
    this.sample_count = sample_count;
    this.material = {shader: new defs.Phong_Shader, ambient: 1.0, color: curve_color}
  }
  update_points(webgl_manager, uniforms, sp) {
    this.arrays.position = [];
    this.arrays.normal = [];
    if (true) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = 1.0 * i / this.sample_count;
        this.arrays.position[i] = sp.get_position(t);
        this.arrays.normal[i] = vec3(0,0,0);
      }
    }
    // this.arrays.position.forEach((v, i) => v = curve_function(i / this.sample_count));
    this.copy_onto_graphics_card(webgl_manager.context);
    // Note: vertex count is not changed.
    // not tested if possible to change the vertex count.
  }
  draw(webgl_manager, uniforms) {
    // call super with "LINE_STRIP" mode
    super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
  }
}


export
const ClawMachine_base = defs.ClawMachine_base =
    class ClawMachine_base extends Component
    {

      init()
      {
        console.log("init")

        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        this.hover = this.swarm = false;

        this.shapes = { 'box'  : new defs.Cube(),
          'ball' : new defs.Subdivision_Sphere( 4 ),
          'axis' : new defs.Axis_Arrows(),
          'cylinder' : new defs.Capped_Cylinder(50,50),
          'text': new Text_Line(45),
          'triangle': new defs.Windmill(7)
        };


        const basic = new defs.Basic_Shader();
        const phong = new defs.Phong_Shader();
        const tex_phong = new defs.Textured_Phong();
        this.materials = {};
        this.materials.text_image = {shader: tex_phong, ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("assets/text.png")}
        this.materials.pink = { shader: phong, ambient: 0.5, diffusivity: 0.5, specularity: 0.1, color: color(1, 0.4, 0.7, 1) };
        this.materials.plastic = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) }
        this.materials.metal   = { shader: phong, ambient: .2, diffusivity: 1, specularity:  1, color: color( .9,.5,.9,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/instr1.png" ) }
        this.materials.checkerboard = { shader: tex_phong, ambient: .4, texture: new Texture( "assets/checkerboard.png" ) }

        this.shapes2 = {
          box_1: new Cube(),
          box_2: new Cube(),
          axis: new Axis_Arrows()
        }

        this.angle=0;




        this.shapes3 = { cube: new defs.Cube(), text: new Text_Line( 35 ) };
        // Don't create any DOM elements to control this scene:


        const texture = new defs.Textured_Phong( 1 );
        this.grey       = { shader: phong, color: color( .5,.5,.5,1 ), ambient: 0,
          diffusivity: .3, specularity: .5, smoothness: 10 }

        // To show text you need a Material like this one:
        this.text_image = { shader: texture, ambient: 1, diffusivity: 0, specularity: 0,
          texture: new Texture( "assets/instr4.png" ) };


        this.shapes1 = {
          // TODO:  Fill in as many additional shape instances as needed in this key/value table.
          //        (Requirement 1)
          sun: new defs.Subdivision_Sphere(4),
          f1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
          f2: new defs.Subdivision_Sphere(3),
          f3: new defs.Subdivision_Sphere(4),
          ring: new defs.Torus(15, 15), //the two radii
          f4: new defs.Subdivision_Sphere(4),
          moon: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1)
          

        };

        // *** Materials for each object
        this.materials1 = {

          // TODO:  Fill in as many additional material objects as needed in this key/value table.
          //        (Requirement 4)

          //sun's color needs to change sinusoidally wrt time
          sun:{shader: phong,ambient: 1, diffusivity: 0, color: color(1, 0.4, 0.7, 1)},

          //planet1, Gouraud
          f1:{shader: phong,ambient: 1, diffusivity: 0, color: color(1, 2, 0.7, 1)},

          //Gouraud shading every odd second, Phong every even second
          f2odd:{shader: phong,ambient: 1, diffusivity: 0, color: color(1, 0.4, 2, 1)},

          //has a ring around it, Gouraud
          f3:{shader: phong,ambient: 1, diffusivity: 0, color: color(1, 0.4, 0.7, 1)},
          //ring's color brightness varies sinusoidally with distance from f3, replace with RingShader

          //moon orbiting around it
          f4:{shader: phong,ambient: 1, diffusivity: 0, color: color(0.2, 0.4, 0.7, 1)},
          moon:{shader: phong,ambient: 1, diffusivity: 0, color: color(1, 1.5, 0.7, 1)}


        }

        this.points = 0;

        // TODO: create class instances
        this.clawTargetPoint = new ControlledPoint(0, 8.5, 0);
        this.machine = new Articulated_Machine();

        this.chain = new Particle_System();
        this.chain.create_particles(10);
        this.chain.create_springs(6);
        this.chain.create_walls(14);
        this.wallTransforms = [
          Mat4.translation(0, 6, -4).times(Mat4.scale(4, 6, 0.1)), // back wall
          Mat4.translation(-4, 6, -0.6).times(Mat4.scale(0.1, 6, 3.4)), // left wall
          Mat4.translation(4, 6, -0.6).times(Mat4.scale(0.1, 6, 3.4)), // right wall
          Mat4.translation(-4, 2, 3.4).times(Mat4.scale(0.1, 2, 0.6)), // lb wall
          Mat4.translation(4, 2, 3.4).times(Mat4.scale(0.1, 2, 0.6)), // rb wall
          // Mat4.translation(0, 0, 0).times(Mat4.scale(4, 0.1, 4)), // bottom wall
          Mat4.translation(-.5, 2.5, -2.25).times(Mat4.scale(.5, 0.1, 1.75)), // floor 1a
          Mat4.translation(-2.5, 2.5, -1).times(Mat4.scale(1.5, 0.1, .5)), // floor 1b
          Mat4.translation(0.5, 2.2, -1.75).times(Mat4.scale(.5, 0.1, 2.25)), // floor 2a
          Mat4.translation(-2, 2.2, 0).times(Mat4.scale(2, 0.1, .5)), // floor 2b
          Mat4.translation(2.5, 1.9, -0.25).times(Mat4.scale(1.5, 0.1, 3.75)), // floor 3a
          Mat4.translation(-1.5, 1.9, 2).times(Mat4.scale(2.5, 0.1, 1.5)), // floor 3b
          Mat4.translation(0, 2, 4).times(Mat4.scale(4, 2, 0.1)), // front wall
          Mat4.translation(0, 4, 3.4).times(Mat4.scale(4.2, 0.1, 0.8)), // control surface
          Mat4.translation(-2.5, 0.5, -1.6).times(Mat4.scale(1.5, 2, 0.1)), // front chute
          Mat4.translation(-1, 0.5, -2.7).times(Mat4.scale(0.1, 2, 1.2)), // right chute
          Mat4.translation(-2.5, 0.5, -3.8).times(Mat4.scale(1.5, 2, 0.1)), // back chute
          Mat4.translation(-3.8, 0.5, -2.7).times(Mat4.scale(0.1, 2, 1.2)) // left chute
        ];

        let start_pos = this.machine.get_end_effector_position();
        let red = color(1, 0, 0, 1);
        let green = color(0, 1, 0, 1);
        let blue = color(0, 0, 1, 1);
        let blackboard_color = color( 0.2, 0.2, 0.2, 1 )

        this.chain.set_particles(0, 1.0,0,start_pos[1]-0.0,0,0,0,0, 0.1, red);
        this.chain.set_particles(1, 1.0,0,start_pos[1]-0.4,0,0,0,0, 0.1, red);
        this.chain.set_particles(2, 1.0,0,start_pos[1]-0.8,0,0,0,0, 0.1, red);
        this.chain.set_particles(3, 1.0,0,start_pos[1]-1.2,0,0,0,0, 0.1, red);
        this.chain.set_particles(4, 1.0,0,start_pos[1]-1.6,0,0,0,0, 0.1, red);
        this.chain.set_particles(5, 1.0,0,start_pos[1]-2.0,0,0,0,0, 0.1, red);
        this.chain.set_particles(6, 8.0,0,start_pos[1]-2.8,0,0,0,0, 0.5, blue);
        this.chain.set_particles(7, 2.0, 2,3,1.5, 0,0,0, 1, green);
        this.chain.set_particles(8, 2.0, -2,3,1.5, 0,0,0, 1, green);
        this.chain.set_particles(9, 2.0, 2,3,-2.5, 0,0,0, 1, green);

        this.chain.link(0,  0, 1 , 500 , 250 , 0.8);
        this.chain.link(1,  1, 2 , 500 , 250 , 0.8);
        this.chain.link(2,  2, 3 , 500, 250 , 0.8);
        this.chain.link(3,  3, 4 , 500, 250 , 0.8);
        this.chain.link(4,  4, 5 , 500, 250 , 0.8);
        this.chain.link(5,  5, 6 , 500, 250 , 1.2);

        for (let i = 0; i < this.wallTransforms.length; i++) {
          let c = blackboard_color;
          if (i == 5 || i == 6) c = color(0, .25, 0, 1);
          if (i == 7 || i == 8) c = color(.25, .25, 0, 1);
          if (i == 9 || i == 10) c = color(.25, 0, 0, 1);
          this.chain.set_wall(i, this.wallTransforms[i], 1000, 1, 0, c);
        }

        this.chain.set_ground(5000,1);
        this.chain.set_gravity(4);
        this.chain.set_air_resistance(0.1);

        this.rightpressed=0;
        this.uppressed=0;
        this.forwardpressed=0;
        this.resetbutton = 0;

        this.releaseright = false;
        this.releaseleft = false;
        this.releaseup = false;
        this.releasedown = false;
        this.releaseforward = false;
        this.releasebackward = false;

        this.incrementScore = 0;
        this.random_set = [];


        //=======================Spline=================================================

        this.ball_location = vec3(1, 1, 1);
        this.ball_radius = 0.25;

        //Hard coded environment as per the spec

        this.spline = new partOne.HermiteSpline();
        // Tangent magnitude remains the same
        let tangentMagnitude = 1.0;
        let height = 0;

        // Redefine spline points and tangents for horizontal orientation facing down
        this.spline.addPoint(vec3(0.0, height, 15.3), vec3(tangentMagnitude, 0.0, 0.0));
        this.spline.addPoint(vec3(7.2, height, 15.3), vec3(0.0, 0.0, -tangentMagnitude));
        this.spline.addPoint(vec3(7.2, height, 22.1), vec3(-tangentMagnitude, 0.0, 0.0));
        this.spline.addPoint(vec3(0.0, height, 22.1), vec3(0.0, 0.0, tangentMagnitude));
        this.spline.addPoint(vec3(0.0,height, 15.3), vec3(tangentMagnitude, 0.0, 0.0));


        const curves = (t)=> this.spline.getPointAt(t)
        this.curve = new partOne.Curve_Shape(curves, 1000, color(0, 0, 0, 1));


      }


      render_animation( caller )
      {                                                // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Assignment2, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if( !caller.controls )
        { this.animated_children.push( caller.controls = new defs.Movement_Controls( { uniforms: this.uniforms } ) );
          caller.controls.add_mouse_controls( caller.canvas );

          // !!! Camera changed here
          // TODO: you can change the camera as needed.
          Shader.assign_camera( Mat4.look_at (vec3 (0,13, 16), vec3 (0, 4.5, -4), vec3 (0, 1, 0)), this.uniforms );
        }
        this.uniforms.projection_transform = Mat4.perspective( Math.PI/4, caller.width/caller.height, 1, 100 );

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = this.t = this.uniforms.animation_time/1000;

        // const light_position = Mat4.rotation( angle,   1,0,0 ).times( vec4( 0,-1,1,0 ) ); !!!
        // !!! Light changed here
        const light_position = vec4(-1.5, 10, 1, 1.0);
        const light_position2 = vec4(1.5, 10, 1, 1.0);

        this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 100 ),
          defs.Phong_Shader.light_source( light_position2, color( 1,1,1,1 ), 100 )];

        const dt = this.uniforms.animation_delta_time / 1000;

        const funny_orbit = Mat4.translation(0,8,-4).times(Mat4.rotation(   Math.PI * Math.pow(Math.sin(Math.PI/8*t),2),   0, 1,0 ));
        this.shapes3.cube.draw( caller, this.uniforms, funny_orbit, this.materials.rgb );

      }
    }


export class ClawMachine extends ClawMachine_base
{

  render_animation( caller )
  {                                                // display():  Called once per frame of animation.  For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
    // different matrix value to control where the shape appears.

    // Variables that are in scope for you to use:
    // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
    // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical surface.
    // this.materials.metal:    Selects a shader and draws with a shiny surface.
    // this.materials.plastic:  Selects a shader and draws a more matte surface.
    // this.lights:  A pre-made collection of Light objects.
    // this.hover:  A boolean variable that changes when the user presses a button.
    // shared_uniforms:  Information the shader needs for drawing.  Pass to draw().
    // caller:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().

    // Call the setup code that we left inside the base class:
    super.render_animation( caller );

    const blue = color( 0,0,1,1 ), yellow = color( 1,0.7,0,1 ),
        red = color( 1,0,0,1 ), green = color( 0,1,0,1 ), white = color( 1,1,1,1 ),
        wall_color = color( 0.7, 1.0, 0.8, 1 ),
        blackboard_color = color( 0.2, 0.2, 0.2, 1 ),
        black = color(0,0,0,1);

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw background
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(15, 0.01, 8));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, this.materials.checkerboard);
    let wall_transform = Mat4.translation(0, 0, -8).times(Mat4.scale(15, 15, 0.01));
    this.shapes.box.draw( caller, this.uniforms, wall_transform,  { ...this.materials.plastic, color: blackboard_color } );
    let l_wall_transform = Mat4.translation(-15, 0, 0).times(Mat4.scale(0.01, 15, 8));
    this.shapes.box.draw( caller, this.uniforms, l_wall_transform,  { ...this.materials.plastic, color: blackboard_color } );
    let r_wall_transform = Mat4.translation(15, 0, 0).times(Mat4.scale(0.01, 15, 8));
    this.shapes.box.draw( caller, this.uniforms, r_wall_transform,  { ...this.materials.plastic, color: blackboard_color } );

    //claw machine walls
    for (let i = 0; i < this.wallTransforms.length; i++) {
      this.shapes.box.draw( caller, this.uniforms, this.wallTransforms[i], { ...this.materials.plastic, color: this.chain.walls[i].color } );
    }

    // controls
    let box_transform = Mat4.translation(0, 4.4, 3.4).times(Mat4.scale(0.4, 0.2, 0.4));
    this.shapes.box.draw( caller, this.uniforms, box_transform, { ...this.materials.plastic, color: blackboard_color } );


    if(this.uppressed > 0  && this.releaseup) {
      this.uppressed-=Math.min(this.uppressed,.08);
    }
    if(this.rightpressed > 0 && this.releaseright) {
      this.rightpressed-=Math.min(this.rightpressed,.08);
    }
    if(this.forwardpressed > 0  && this.releaseforward) {
      this.forwardpressed-=Math.min(this.forwardpressed,.08);
    }

    if(this.uppressed < 0  && this.releasedown) {
      this.uppressed+=Math.min(-this.uppressed,.08);
    }
    if(this.rightpressed < 0  && this.releaseleft) {
      this.rightpressed+=Math.min(-this.rightpressed,.08);
    }
    if(this.forwardpressed < 0 && this.releasebackward) {
      this.forwardpressed+=Math.min(-this.forwardpressed,.08);
    }

    if(this.resetbutton > 0) {
      this.resetbutton-=Math.min(this.resetbutton,.08);
    }


    let stick_transform = Mat4.translation(0, 4.6, 3.4).times(Mat4.scale(0.1, 0.3, 0.1));
    this.shapes.box.draw( caller, this.uniforms, stick_transform, { ...this.materials.plastic, color: blackboard_color } );

    let ball_transform = Mat4.translation(0, 4.9+0.05*this.uppressed, 3.4).times(Mat4.scale(0.2, 0.2, 0.2));
    this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.plastic, color: yellow } );

    let uparr_transform = Mat4.translation(-2, 4.13-0.05*Math.max(0,this.forwardpressed), 3).times(Mat4.scale(0.2, 0.07, 0.2));
    this.shapes.box.draw( caller, this.uniforms, uparr_transform, { ...this.materials.plastic, color: yellow } );

    let downarr_transform = Mat4.translation(-2, 4.13+0.05*Math.min(0,this.forwardpressed), 3.9).times(Mat4.scale(0.2, 0.07, 0.2));
    this.shapes.box.draw( caller, this.uniforms, downarr_transform, { ...this.materials.plastic, color: yellow } );

    let leftarr_transform = Mat4.translation(-2.5, 4.13+0.05*Math.min(0,this.rightpressed), 3.4).times(Mat4.scale(0.2, 0.07, 0.2));
    this.shapes.box.draw( caller, this.uniforms, leftarr_transform, { ...this.materials.plastic, color: yellow } );

    let rightarr_transform = Mat4.translation(-1.5, 4.13-0.05*Math.max(0,this.rightpressed), 3.4).times(Mat4.scale(0.2, 0.07, 0.2));
    this.shapes.box.draw( caller, this.uniforms, rightarr_transform, { ...this.materials.plastic, color: yellow } );

    let button_transform = Mat4.translation(2, 4.13-0.05*Math.max(0,this.resetbutton), 3.4).times(Mat4.scale(0.3, 0.12, 0.3).times(Mat4.rotation(Math.PI / 2,1, 0, 0)));
    this.shapes.cylinder.draw( caller, this.uniforms, button_transform, { ...this.materials.plastic, color: yellow } );

    // let point_msg = "Score: " + this.points.toString()
    // this.shapes.text.set_string(point_msg, caller);
    // this.shapes.text.draw(caller, this.uniforms, (Mat4.translation(-2, 2.8, 4.2)).times(Mat4.scale(0.2, 0.2, 0.2)), this.materials.text_image);

    // Draw the pink scoreboard box
    let scoreboard_transform = Mat4.translation(0, 2.8, 4.2).times(Mat4.scale(2, 0.3, 0.01));
    this.shapes.box.draw(caller, this.uniforms, scoreboard_transform, this.materials.pink);

    // Draw the score text over the pink box
    let point_msg = "Score: " + this.points.toString();
    this.shapes.text.set_string(point_msg, caller);
    this.shapes.text.draw(caller, this.uniforms, (Mat4.translation(-1, 2.8, 4.22)).times(Mat4.scale(0.2, 0.2, 0.2)), this.materials.text_image);

    //draw decorations around machine:

    // TODO: claw machine
    // inverse kinematics for arm to target point
    let p_end = this.clawTargetPoint.pos; // desired end effector position
    let p = this.machine.get_end_effector_position();
    let error = p_end.minus(p);

    if ( error.norm() > 0.1) {
      for (let i = 0; i < 1; i++) {
        let _dx = error.times(0.2); // take a step to reduce error
        let dx = [[_dx[0]], [_dx[1]], [_dx[2]]];

        let J = this.machine.calculate_Jacobian() // compute Jacobian

        let theta_d = this.machine.calculate_delta_theta(J, dx); // change in joint angles
        theta_d = math.dotMultiply(math.transpose(theta_d), 1);
        let dtheta = [theta_d[0][0], theta_d[0][1], theta_d[0][2], theta_d[0][3]]

        this.machine.theta = math.add(this.machine.theta, dtheta); // update joint angles
        this.machine.apply_theta();

        p = this.machine.get_end_effector_position(); // update end effector position
        error = p_end.minus(p); // update error
      }
    }
    this.machine.draw( caller, this.uniforms, { ...this.materials.metal, color: blue });

    // TODO: wrecking ball and chain
    this.t_sim = t;
    let dt = this.dt = 1 / 60;
    this.t_step = 1 / 1000;
    this.integration_method = "symplectic";

    //=======================Spline=================================================

    //perform update
    const t_next = this.t + dt;
    while (this.t_sim < t_next) {
      let prev_pos = this.chain.particles[0].pos;
      this.chain.particles[0].pos = this.machine.get_end_effector_position();
      this.chain.particles[0].velocity = (this.chain.particles[0].pos.minus(prev_pos)).times(1 / this.t_step)
      this.chain.update_particles(this.t_step, this.integration_method, true);
      this.t_sim += this.t_step;
    }

    // check for balls in the chute
    for (let i = 0; i < this.chain.particles.length; i++) {
      if (this.chain.particles[i].pos[1] < 0) {
        this.scored();
        this.chain.particles.splice(i, 1);
        this.chain.create_particles(1);
        this.chain.set_particles(this.chain.particles.length - 1, 2.0, 2,15,1.5, 0,0,0, 1, green);
      }
    }

    //let t = (this.t_sim ) % 1; // Adjust time for spline animation
    let target = this.spline.getPointAt((this.t_sim * 0.05) % 1);          //console.log(target);

    //Shape 1
    let star_transform = Mat4.translation(target[0] -3.5, target[1] + 12, target[2] -19).times(Mat4.scale(0.25, 0.25, 0.25));
    this.shapes.ball.draw(caller, this.uniforms, star_transform, {...this.materials.metal, color: blue});

    // Shape 2
    let t2 = ((this.t_sim - 1) * 0.05);
    if (t2 < 0) {
        t2 += Math.ceil(Math.abs(t2)); // Adjust t2 to be non-negative
    }
    t2 %= 1;
    let target2 = this.spline.getPointAt(t2);
    let star_transform2 = Mat4.translation(target2[0] -3.5, target2[1] + 12, target2[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
    this.shapes.triangle.draw(caller, this.uniforms, star_transform2, {...this.materials.metal, color: yellow});

    //Shape 3
    let t3 = ((this.t_sim - 2) * 0.05);
    if (t3 < 0) {
        t3 += Math.ceil(Math.abs(t3)); // Adjust t3 to be non-negative
    }
    t3 %= 1;
    let target3 = this.spline.getPointAt(t3);
    let star_transform3 = Mat4.translation(target3[0] -3.5, target3[1] + 12, target3[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
    this.shapes.ball.draw(caller, this.uniforms, star_transform3, {...this.materials.metal, color: red});

    //Shape 4
    let t4 = ((this.t_sim - 3) * 0.05);
    if (t4 < 0) {
        t4 += Math.ceil(Math.abs(t4)); // Adjust t3 to be non-negative
    }
    t4 %= 1;
    let target4 = this.spline.getPointAt(t4);
    let star_transform4 = Mat4.translation(target4[0] -3.5, target4[1] + 12, target4[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
    this.shapes.triangle.draw(caller, this.uniforms, star_transform4, {...this.materials.metal, color: green});

    //Shape 5
    let t5 = ((this.t_sim - 4) * 0.05);
    if (t5 < 0) {
        t5 += Math.ceil(Math.abs(t5)); // Adjust t3 to be non-negative
    }
    t5 %= 1;
    let target5 = this.spline.getPointAt(t5);
    let star_transform5 = Mat4.translation(target5[0] -3.5, target5[1] + 12, target5[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
    this.shapes.ball.draw(caller, this.uniforms, star_transform5, {...this.materials.metal, color: white});

    //Shape 6
    let t6 = ((this.t_sim - 5) * 0.05);
    if (t6 < 0) {
        t6 += Math.ceil(Math.abs(t6)); // Adjust t3 to be non-negative
    }
    t6 %= 1;
    let target6 = this.spline.getPointAt(t6);
    let star_transform6 = Mat4.translation(target6[0] -3.5, target6[1] + 12, target6[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
    this.shapes.triangle.draw(caller, this.uniforms, star_transform6, {...this.materials.metal, color: blue});

      //Shape 7
      let t7 = ((this.t_sim - 6) * 0.05);
      if (t7 < 0) {
          t7 += Math.ceil(Math.abs(t7)); // Adjust t3 to be non-negative
      }
      t7 %= 1;
      let target7 = this.spline.getPointAt(t7);
      let star_transform7 = Mat4.translation(target7[0] -3.5, target7[1] + 12, target7[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform7, {...this.materials.metal, color: yellow});
    
      //Shape 8
      let t8 = ((this.t_sim - 7) * 0.05);
      if (t8 < 0) {
          t8 += Math.ceil(Math.abs(t8)); // Adjust t3 to be non-negative
      }
      t8 %= 1;
      let target8 = this.spline.getPointAt(t8);
      let star_transform8 = Mat4.translation(target8[0] -3.5, target8[1] + 12, target8[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
      this.shapes.triangle.draw(caller, this.uniforms, star_transform8, {...this.materials.metal, color: red});

      //Shape 9
      let t9 = ((this.t_sim - 8) * 0.05);
      if (t9 < 0) {
          t9 += Math.ceil(Math.abs(t9)); // Adjust t3 to be non-negative
      }
      t9 %= 1;
      let target9 = this.spline.getPointAt(t9);
      let star_transform9 = Mat4.translation(target9[0] -3.5, target9[1] + 12, target9[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform9, {...this.materials.metal, color: green});

    //Shape 10
      let t10 = ((this.t_sim - 9) * 0.05);
      if (t10 < 0) {
          t10 += Math.ceil(Math.abs(t10)); // Adjust t3 to be non-negative
      }
      t10 %= 1;
      let target10 = this.spline.getPointAt(t10);
      let star_transform10 = Mat4.translation(target10[0] -3.5, target10[1] + 12, target10[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
      this.shapes.triangle.draw(caller, this.uniforms, star_transform10, {...this.materials.metal, color: white});

    //Shape 11
      let t11 = ((this.t_sim - 10) * 0.05);
      if (t11 < 0) {
          t11 += Math.ceil(Math.abs(t11)); // Adjust t3 to be non-negative
      }
      t11 %= 1;
      let target11 = this.spline.getPointAt(t11);
      let star_transform11 = Mat4.translation(target11[0] -3.5, target11[1] + 12, target11[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform11, {...this.materials.metal, color: blue});

      //Shape 12
      let t12 = ((this.t_sim - 11) * 0.05);
      if (t12 < 0) {
          t12 += Math.ceil(Math.abs(t12)); // Adjust t3 to be non-negative
      }
      t12 %= 1;
      let target12 = this.spline.getPointAt(t12);
      let star_transform12 = Mat4.translation(target12[0] -3.5, target12[1] + 12, target12[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
      this.shapes.triangle.draw(caller, this.uniforms, star_transform12, {...this.materials.metal, color: yellow});

      //Shape 13
      let t13 = ((this.t_sim - 12) * 0.05);
      if (t13 < 0) {
          t13 += Math.ceil(Math.abs(t13)); // Adjust t3 to be non-negative
      }
      t13 %= 1;
      let target13 = this.spline.getPointAt(t13);
      let star_transform13 = Mat4.translation(target13[0] -3.5, target13[1] + 12, target13[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform13, {...this.materials.metal, color: red});

    //Shape 14
      let t14 = ((this.t_sim - 13) * 0.05);
      if (t14 < 0) {
          t14 += Math.ceil(Math.abs(t14)); // Adjust t3 to be non-negative
      }
      t14 %= 1;
      let target14 = this.spline.getPointAt(t14);
      let star_transform14 = Mat4.translation(target14[0] -3.5, target14[1] + 12, target14[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
      this.shapes.triangle.draw(caller, this.uniforms, star_transform14, {...this.materials.metal, color: green});

      //Shape 15
      let t15 = ((this.t_sim - 14) * 0.05);
      if (t15 < 0) {
          t15 += Math.ceil(Math.abs(t15)); // Adjust t3 to be non-negative
      }
      t15 %= 1;
      let target15 = this.spline.getPointAt(t15);
      let star_transform15 = Mat4.translation(target15[0] -3.5, target15[1] + 12, target15[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform15, {...this.materials.metal, color: white});

    //Shape 16
      let t16 = ((this.t_sim - 15) * 0.05);
      if (t16 < 0) {
          t16 += Math.ceil(Math.abs(t16)); // Adjust t3 to be non-negative
      }
      t16 %= 1;
      let target16 = this.spline.getPointAt(t16);
      let star_transform16 = Mat4.translation(target16[0] -3.5, target16[1] + 12, target16[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
      this.shapes.triangle.draw(caller, this.uniforms, star_transform16, {...this.materials.metal, color: blue});

    //Shape 17
      let t17 = ((this.t_sim - 16) * 0.05);
      if (t17 < 0) {
          t17 += Math.ceil(Math.abs(t17)); // Adjust t3 to be non-negative
      }
      t17 %= 1;
      let target17 = this.spline.getPointAt(t17);
      let star_transform17 = Mat4.translation(target17[0] -3.5, target17[1] + 12, target17[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
      this.shapes.ball.draw(caller, this.uniforms, star_transform17, {...this.materials.metal, color: yellow});


    //Shape 18
    let t18 = ((this.t_sim - 17) * 0.05);
    if (t18 < 0) {
        t18 += Math.ceil(Math.abs(t18)); // Adjust t3 to be non-negative
    }
    t18 %= 1;
    let target18 = this.spline.getPointAt(t18);
    let star_transform18 = Mat4.translation(target18[0] -3.5, target18[1] + 12, target18[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
    this.shapes.triangle.draw(caller, this.uniforms, star_transform18, {...this.materials.metal, color: red});

    //Shape 19
    let t19 = ((this.t_sim - 18) * 0.05);
    if (t19 < 0) {
        t19 += Math.ceil(Math.abs(t19)); // Adjust t3 to be non-negative
    }
    t19 %= 1;
    let target19 = this.spline.getPointAt(t19);
    let star_transform19 = Mat4.translation(target19[0] -3.5, target19[1] + 12, target19[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25));
    this.shapes.ball.draw(caller, this.uniforms, star_transform19, {...this.materials.metal, color: green});


    //Shape 20
    let t20 = ((this.t_sim - 19) * 0.05);
    if (t20 < 0) {
        t20 += Math.ceil(Math.abs(t20)); // Adjust t3 to be non-negative
    }
    t20 %= 1;
    let target20 = this.spline.getPointAt(t20);
    let star_transform20 = Mat4.translation(target20[0] -3.5, target20[1] + 12, target20[2] - 19).times(Mat4.scale(0.25, 0.25, 0.25)).times(Mat4.rotation( Math.PI / 2, 1,0,0));
    this.shapes.triangle.draw(caller, this.uniforms, star_transform20, {...this.materials.metal, color: white});

    


    let curve_transform = Mat4.translation(-3.5, 12, -19); // Adjust Z to be slightly in front of the blackboard
    this.curve.draw(caller, this.uniforms, curve_transform);


    // draw the particles
    for (let particle of this.chain.particles) {
      let radius = particle.radius;
      let particle_transform = Mat4.translation(particle.pos[0], particle.pos[1], particle.pos[2])
          .times(Mat4.scale(radius, radius, radius));
      this.shapes.ball.draw(caller, this.uniforms, particle_transform, {...this.materials.metal, color: particle.color });
    }

    // draw the springs
    for (const s of this.chain.springs) {
      const p1 = this.chain.particles[s.particle_1].pos;
      const p2 = this.chain.particles[s.particle_2].pos;
      const len = (p2.minus(p1)).norm();
      const center = (p1.plus(p2)).times(0.5);

      let model_transform = Mat4.scale(0.05, len / 2, 0.05);

      const p = p1.minus(p2).normalized();
      let v = vec3(0,1,0);
      if (Math.abs(v.cross(p).norm()) < 0.1) {
        v = vec3(0,0,1);
        model_transform = Mat4.scale(0.05, 0.05, len / 2);
      }
      const w = v.cross(p).normalized();

      const theta = Math.acos(v.dot(p));
      model_transform.pre_multiply(Mat4.rotation(theta, w[0],w[1],w[2]));
      model_transform.pre_multiply(Mat4.translation(center[0], center[1],center[2]));
      this.shapes.box.draw(caller, this.uniforms, model_transform, { ...this.materials.metal, color: red });
    }

    this.clawTargetPoint.step(0.075);
    //this.shapes.ball.draw( caller, this.uniforms, Mat4.translation(...this.clawTargetPoint.pos).times(Mat4.scale(0.5,0.5,0.5)), { ...this.materials.plastic, color: white } );


    // TODO: Game interactivity

    if (this.incrementScore > 0) {
      // celebration animation
      this.incrementScore -= 0.015;
      let num_confetti = 10;
      let r = this.random_set;
      for (let i = 0; i < num_confetti; i++) {
        let x = -2.2 + 0.2 * r[i] + 1.2 * r[i] * Math.pow(-1,i) * (1 - this.incrementScore);
        let y = 4 + 0.7 * r[i] + 5 * Math.log(1.1-(this.incrementScore+0.1));
        let z = -3 + 0.2 * r[i] + 1.2 * r[i] * Math.pow(-1,i+Math.round(10*r[i])) * (1- this.incrementScore);

        let confetti_transform = Mat4.translation(x, y, z)
            .times(Mat4.translation(-0.2, 0 , 0))
            .times(Mat4.rotation(25 * t + 10 * r[i], 0, 1, 0))
            .times(Mat4.translation(0.2, 0 , 0))
            .times(Mat4.scale(0.15, 0.15, 0.15));
        let col = yellow;
        if (Math.round(r[i] * 10) % 2 === 0) { col = white; }
        if (Math.round(r[i] * 10) % 3 === 0) { col = red; }
        this.shapes.ball.draw( caller, this.uniforms, confetti_transform, { ...this.materials.plastic, color: col } );
      }

    }

    // TODO: Decorations
    //the 4 planets orbiting the sun
    let angle1=t;
    let angle2=t+3;
    let angle3=t;
    let angle4=t+3;

    let p1x=1*Math.cos(angle1);
    let p1y=1*Math.sin(angle1);
    let p2x=1*Math.cos(angle2);
    let p2y=1*Math.sin(angle2);
    let p3x=1*Math.cos(angle3);
    let p3y=1*Math.sin(angle3);
    let p4x=1*Math.cos(angle4);
    let p4y=1*Math.sin(angle4);

    this.shapes1.f1.draw(caller, this.uniforms,Mat4.translation(-4,p1y+6, p1x).times(Mat4.scale(0.2,0.2,0.2)),this.materials1.f1);

    this.shapes1.f2.draw(caller, this.uniforms,Mat4.translation(-4,p2y+6,p2x).times(Mat4.scale(0.2,0.2,0.2)),this.materials1.f2odd);

    this.shapes1.f3.draw(caller, this.uniforms,Mat4.translation(4,p3y+6,p3x).times(Mat4.scale(0.2,0.2,0.2)),this.materials1.f3);

    this.shapes1.f4.draw(caller, this.uniforms,Mat4.translation(4,p4y+6,p4x).times(Mat4.scale(0.2,0.2,0.2)),this.materials1.f4);

    this.angle+=0.001;



    for (; this.t_sim <= this.t_next; this.t_sim += this.t_step) {

      let target;
      console.log("target", target);
    
          //let t = (this.t_sim ) % 1; // Adjust time for spline animation
          target = this.hermiteSpline.getPointAt(t);
          target[0] = -3.5 + target[0];
          target[1] = 12 + target[1];
          target[2] = -19 + target[2];
          let star_transform = Mat4.translation(target);
          this.shapes.f1.draw(caller, this.uniforms, star_transform, this.materials1.f1);
          console.log("printed");
    }
    

  }

  render_controls()
  {
    // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.control_panel.innerHTML += "Assignment 2: IK Engine";
    this.new_line();
    // TODO: add your button events
    this.key_triggered_button( "Up", [ "q" ], ()=>this.moveup(1), undefined, ()=>this.endmoveup(1));
    this.key_triggered_button( "Forward", [ "w" ], ()=>this.moveforward(1), undefined, ()=>this.endmoveforward(1) );
    this.key_triggered_button( "Down", [ "e" ], ()=>this.moveup(-1),undefined, ()=>this.endmoveup(-1) );
    this.new_line();
    this.key_triggered_button( "Left", [ "a" ], ()=>this.moveright(-1), undefined, ()=>this.endmoveright(-1) );
    this.key_triggered_button( "Backward", [ "s" ], ()=>this.moveforward(-1),undefined, ()=>this.endmoveforward(-1) );
    this.key_triggered_button( "Right", [ "d" ], ()=>this.moveright(1), undefined, ()=>this.endmoveright(1) );
    this.new_line();
    this.key_triggered_button( "Test score animation", [ "t" ], ()=>this.scored() );
    this.key_triggered_button( "Reset score", [ "Alt", "r" ], ()=>this.reset());

  }

  moveright(val) {
    if (val > 0) {
      this.clawTargetPoint.rightStart();
      this.releaseright = false;
    }
    else {
      this.clawTargetPoint.leftStart();
      this.releaseleft = false;
    }

    if(this.rightpressed===0) {
      this.rightpressed+=val;
    }
  }

  endmoveright(val) {
    if (val > 0) {
      this.clawTargetPoint.rightEnd();
      this.releaseright = true;
    }
    else {
      this.clawTargetPoint.leftEnd();
      this.releaseleft = true;
    }
  }

  moveup(val) {
    if (val > 0) {
      this.clawTargetPoint.upStart();
      this.releaseup = false;
    }
    else {
      this.clawTargetPoint.downStart();
      this.releasedown = false;
    }

    if(this.uppressed===0){
      this.uppressed+=val;
    }
  }

  endmoveup(val) {
    if (val > 0) {
      this.clawTargetPoint.upEnd();
      this.releaseup = true;
    }
    else {
      this.clawTargetPoint.downEnd();
      this.releasedown = true;
    }
  }

  moveforward(val) {
    if (val > 0) {
      this.clawTargetPoint.inStart();
      this.releaseforward = false;
    }
    else {
      this.clawTargetPoint.outStart();
      this.releasebackward = false;
    }

    if(this.forwardpressed===0){
      this.forwardpressed+=val;
    }
  }

  endmoveforward(val) {
    if (val > 0) {
      this.clawTargetPoint.inEnd();
      this.releaseforward = true;
    }
    else {
      this.clawTargetPoint.outEnd();
      this.releasebackward = true;
    }
  }

  reset() {
    this.resetbutton = 1;
    // reset the boxes in the machine
    this.points = 0;
  }

  scored() {
    this.points += 1;
    this.incrementScore = 1;
    for (let i = 0; i < 30; i++) {
      this.random_set[i] = Math.random();
    }
  }
}






