import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

// TODO: you should implement the required classes here or in another file.

export
const Part_one_hermite_base = defs.Part_one_hermite_base =
    class Part_one_hermite_base extends Component
    {                                          // **My_Demo_Base** is a Scene that can be added to any display canvas.
                                               // This particular scene is broken up into two pieces for easier understanding.
                                               // The piece here is the base class, which sets up the machinery to draw a simple
                                               // scene demonstrating a few concepts.  A subclass of it, Part_one_hermite,
                                               // exposes only the display() method, which actually places and draws the shapes,
                                               // isolating that code so it can be experimented with on its own.
      init()
      {
        console.log("init")

        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
        // would be redundant to tell it again.  You should just re-use the
        // one called "box" more than once in display() to draw multiple cubes.
        // Don't define more than one blueprint for the same thing here.
        this.shapes = { 'box'  : new defs.Cube(),
          'ball' : new defs.Subdivision_Sphere( 4 ),
          'axis' : new defs.Axis_Arrows() };

        // *** Materials: ***  A "material" used on individual shapes specifies all fields
        // that a Shader queries to light/color it properly.  Here we use a Phong shader.
        // We can now tweak the scalar coefficients from the Phong lighting formulas.
        // Expected values can be found listed in Phong_Shader::update_GPU().
        const phong = new defs.Phong_Shader();
        const tex_phong = new defs.Textured_Phong();
        this.materials = {};
        this.materials.plastic = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) }
        this.materials.metal   = { shader: phong, ambient: .2, diffusivity: 1, specularity:  1, color: color( .9,.5,.9,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) }

        this.ball_location = vec3(1, 1, 1);
        this.ball_radius = 0.25;

        // TODO: you should create a Spline class instance
        this.spline = new HermiteSpline();
        const curve_function = (t)=> this.spline.getPointAt(t);
        this.curve = new Curve_Shape(curve_function, 1000, color(1, 0, 0, 1));
      
      }

      render_animation( caller )
      { // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Part_one_hermite, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if( !caller.controls )
        { this.animated_children.push( caller.controls = new defs.Movement_Controls( { uniforms: this.uniforms } ) );
          caller.controls.add_mouse_controls( caller.canvas );

          // Define the global camera and projection matrices, which are stored in shared_uniforms.  The camera
          // matrix follows the usual format for transforms, but with opposite values (cameras exist as
          // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
          // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() or
          // orthographic() automatically generate valid matrices for one.  The input arguments of
          // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.

          // !!! Camera changed here
          Shader.assign_camera( Mat4.look_at (vec3 (10, 10, 10), vec3 (0, 0, 0), vec3 (0, 1, 0)), this.uniforms );
        }
        this.uniforms.projection_transform = Mat4.perspective( Math.PI/4, caller.width/caller.height, 1, 100 );

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = this.t = this.uniforms.animation_time/1000;
        const angle = Math.sin( t );

        // const light_position = Mat4.rotation( angle,   1,0,0 ).times( vec4( 0,-1,1,0 ) ); !!!
        // !!! Light changed here
        const light_position = vec4(20 * Math.cos(angle), 20,  20 * Math.sin(angle), 1.0);
        this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 1000000 ) ];

        // draw axis arrows.
        this.shapes.axis.draw(caller, this.uniforms, Mat4.identity(), this.materials.rgb);
      }
    }


export class Part_one_hermite extends Part_one_hermite_base
{                                                    // **Part_one_hermite** is a Scene object that can be added to any display canvas.
                                                     // This particular scene is broken up into two pieces for easier understanding.
                                                     // See the other piece, My_Demo_Base, if you need to see the setup code.
                                                     // The piece here exposes only the display() method, which actually places and draws
                                                     // the shapes.  We isolate that code so it can be experimented with on its own.
                                                     // This gives you a very small code sandbox for editing a simple scene, and for
                                                     // experimenting with matrix transformations.
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

    /**********************************
     Start coding down here!!!!
     **********************************/
        // From here on down it's just some example shapes drawn for you -- freely
        // replace them with your own!  Notice the usage of the Mat4 functions
        // translation(), scale(), and rotation() to generate matrices, and the
        // function times(), which generates products of matrices.

    const blue = color( 0,0,1,1 ), yellow = color( 1,0.7,0,1 );

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: yellow } );

    // !!! Draw ball (for reference)
    let ball_transform = Mat4.translation(this.ball_location[0], this.ball_location[1], this.ball_location[2])
        .times(Mat4.scale(this.ball_radius, this.ball_radius, this.ball_radius));
    this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.metal, color: blue } );

    
    // TODO: you should draw spline here.
    this.curve.draw(caller, this.uniforms);

  }

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.control_panel.innerHTML += "Part One:";
    this.new_line();
    this.key_triggered_button( "Parse Commands", [], this.parse_commands );
    this.new_line();
    this.key_triggered_button( "Draw", [], this.update_scene );
    this.new_line();
    this.key_triggered_button( "Load", [], this.load_spline );
    this.new_line();
    this.key_triggered_button( "Export", [], this.export_spline );
    this.new_line();
    this.key_triggered_button("Look-Up Table", [], () => {
        this.spline.printArcLengthTable();
    });

    /* Some code for your reference
    this.key_triggered_button( "Copy input", [ "c" ], function() {
      let text = document.getElementById("input").value;
      console.log(text);
      document.getElementById("output").value = text;
    } );
    this.new_line();
    this.key_triggered_button( "Relocate", [ "r" ], function() {
      let text = document.getElementById("input").value;
      const words = text.split(' ');
      if (words.length >= 3) {
        const x = parseFloat(words[0]);
        const y = parseFloat(words[1]);
        const z = parseFloat(words[2]);
        this.ball_location = vec3(x, y, z)
        document.getElementById("output").value = "success";
      }
      else {
        document.getElementById("output").value = "invalid input";
      }
    } );
     */
  }

  parse_commands() {

    // Reset arrays
    this.spline.controlPoints = []; // Array of vec3 for control points
    this.spline.tangents = [];      // Array of vec3 for tangents
    let outputText = ""; // Initialize output text


    let commands = document.getElementById("input").value.split('\n');
    for (let command of commands) {
        const parts = command.trim().split(/\s+/);

        if (parts[0] === 'add' && parts[1] === 'point' && parts.length === 8) {
            const point = vec3(parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
            const tangent = vec3(parseFloat(parts[5]), parseFloat(parts[6]), parseFloat(parts[7]));
            console.log("point is: ", point);
                this.spline.addPoint(point, tangent);
                console.log(`Added point: ${point.toString()}, Tangent: ${tangent.toString()}`);
        } else if (parts[0] === 'set' && parts[1] === 'tangent' && parts.length === 6) {
            const index = parseInt(parts[2], 10);
            const tangent = vec3(parseFloat(parts[3]), parseFloat(parts[4]), parseFloat(parts[5]));
                this.spline.setTangent(index, tangent);
                console.log(`Set tangent at index ${index} to ${tangent.toString()}`);

        } else if (parts[0] === 'set' && parts[1] === 'point' && parts.length === 6) {
            const index = parseInt(parts[2], 10);
            const point = vec3(parseFloat(parts[3]), parseFloat(parts[4]), parseFloat(parts[5]));
              this.spline.setPoint(index, point);
              console.log(`Set point at index ${index} to ${point.toString()}`);

        } else if (parts[0] === 'get_arc_length') {
            const arcLength = this.spline.get_arc_length();
            outputText += `Arc length: ${arcLength}\n`;

        } else {
            console.error('Invalid command format:', command);
        }
    }

    document.getElementById("output").value = outputText;


}

update_scene() {
  // Callback for the Draw button
  document.getElementById("output").value = "update_scene";

  // Define the curve function based on the Hermite spline
  const curve_function = t => this.spline.getPointAt(t);

  // Create a new Curve_Shape instance with the curve function
  // Assuming `webgl_manager` and `uniforms` are available in your context
  this.curve = new Curve_Shape(curve_function, 1000, color(1, 0, 0, 1));

}

load_spline() {

    this.spline = new HermiteSpline();

    let commands = document.getElementById("input").value.split('\n');
    
    for (let command of commands) {
        const parts = command.trim().split(/\s+/);

        if (parts[0] === 'add' && parts[1] === 'point' && parts.length === 8) {
            const point = vec3(parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
            const tangent = vec3(parseFloat(parts[5]), parseFloat(parts[6]), parseFloat(parts[7]));
            console.log("point is: ", point);
                this.spline.addPoint(point, tangent);
                console.log(`2: Added point : ${point.toString()}, Tangent: ${tangent.toString()}`);
        } else if (parts[0] === 'set' && parts[1] === 'tangent' && parts.length === 6) {
            const index = parseInt(parts[2], 10);
            const tangent = vec3(parseFloat(parts[3]), parseFloat(parts[4]), parseFloat(parts[5]));
                this.spline.setTangent(index, tangent);
                console.log(`2: Set tangent at index ${index} to ${tangent.toString()}`);

        } else if (parts[0] === 'set' && parts[1] === 'point' && parts.length === 6) {
            const index = parseInt(parts[2], 10);
            const point = vec3(parseFloat(parts[3]), parseFloat(parts[4]), parseFloat(parts[5]));
              this.spline.setPoint(index, point);
              console.log(`2: Set point at index ${index} to ${point.toString()}`);

        } 
    }

    this.spline.buildArcLengthTable(); // Call to build the table
  
    document.getElementById("output").value = "Spline loaded successfully";
    this.update_scene(); // Update the scene with the new spline

  }
  
export_spline() {
    let outputText = this.spline.controlPoints.length;
  
    for (let i = 0; i < this.spline.controlPoints.length; i++) {
      const c = this.spline.controlPoints[i]; // control point
      const t = this.spline.tangents[i];       // tangent
  
      outputText += `\nc_${c[0]} c_${c[1]} c_${c[2]} t_${t[0]} t_${t[1]} t_${t[2]}`;
    }
  
    document.getElementById("output").value = outputText;
  }
  

}

export class HermiteSpline {
  constructor() {
      this.controlPoints = []; // Array of vec3 for control points
      this.tangents = [];      // Array of vec3 for tangents
      this.arcLengthTable = []; // Array for the look-up table of arc lengths

  }

  addPoint(position, tangent) {
      // Add a new control point and its tangent at the end of the arrays
    // Create new objects for control point and tangent

    // Add the new control point and its tangent to the arrays
    this.controlPoints.push(position);
    this.tangents.push(tangent);
}


  setTangent(index, tangent) {
      // Set the components of the tangent at the specified index
      if (index < this.tangents.length) {
          this.tangents[index] = tangent;
      }
  }

  setPoint(index, point) {
      // Set the components of the control point at the specified index
      if (index < this.controlPoints.length) {
          this.controlPoints[index] = point;
      }
  }


getPointAt(t) {
  //if (this.controlPoints.length < 2) {
  //    throw new Error("Insufficient control points");
  //}
  if (this.controlPoints.length === 0) {
    return vec3(0, 0, 0);
}
  // Determine the appropriate segment
  const n = this.controlPoints.length - 1;
  const segmentIndex = Math.min(Math.floor(t * n), n - 1);
  const segmentT = (t - (segmentIndex / n)) * n;

  // Retrieve the control points for the segment
  const p0 = this.controlPoints[segmentIndex];
  const p1 = this.controlPoints[segmentIndex + 1];

  // Retrieve and scale the tangents for the segment
  // Assuming standard Hermite spline, not Catmull-Rom
  let t0 = this.tangents[segmentIndex].times(1.0 / n);
  let t1 = this.tangents[segmentIndex + 1].times(1.0 / n);

  // Hermite basis functions
  const h00 = (2 * segmentT * segmentT * segmentT) - (3 * segmentT * segmentT) + 1;
  const h10 = segmentT * segmentT * segmentT - 2 * segmentT * segmentT + segmentT;
  const h01 = (-2 * segmentT * segmentT * segmentT) + (3 * segmentT * segmentT);
  const h11 = segmentT * segmentT * segmentT - segmentT * segmentT;

  // Compute the interpolated point
  return p0.times(h00).plus(t0.times(h10)).plus(p1.times(h01)).plus(t1.times(h11));
  
}



get_arc_length() {
    const steps = 1000; // Number of steps to divide the spline into
    let length = 0;
    let prevPoint = this.getPointAt(0);

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const currentPoint = this.getPointAt(t);
        // Calculate the distance using Vector3 methods
        const distance = prevPoint.minus(currentPoint).norm();
        length += distance;
        prevPoint = currentPoint;
    }

    return length;
}


  // Method to build the arc length table
  buildArcLengthTable(samples = 20) {
    let totalLength = 0;
    let prevPoint = this.getPointAt(0);
    this.arcLengthTable.push({ u: 0, s: 0 });

    for (let i = 1; i <= samples; i++) {
        const t = i / samples;
        const currentPoint = this.getPointAt(t);
        const segmentLength = prevPoint.minus(currentPoint).norm();
        totalLength += segmentLength;
        this.arcLengthTable.push({ u: t, s: totalLength });
        prevPoint = currentPoint;
    }
  }

  // Method to find parametric value u for a given arc length s
  findParamForArcLength(s) {
    if (this.arcLengthTable.length === 0) {
        throw new Error("Arc length table has not been built.");
    }

    // Handle cases where s is outside the range of the arc lengths
    if (s <= 0) return 0;
    if (s >= this.arcLengthTable[this.arcLengthTable.length - 1].s) {
        return 1;
    }

    // Binary search in the arc length table
    let low = 0, high = this.arcLengthTable.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (this.arcLengthTable[mid].s < s) {
            low = mid + 1;
        } else if (this.arcLengthTable[mid].s > s && (!this.arcLengthTable[mid - 1] || this.arcLengthTable[mid - 1].s < s)) {
            // Interpolate between this.arcLengthTable[mid - 1].u and this.arcLengthTable[mid].u
            const lengthBefore = this.arcLengthTable[mid - 1] ? this.arcLengthTable[mid - 1].s : 0;
            const t = (s - lengthBefore) / (this.arcLengthTable[mid].s - lengthBefore);
            return this.arcLengthTable[mid - 1].u + t * (this.arcLengthTable[mid].u - this.arcLengthTable[mid - 1].u);
        } else {
            high = mid - 1;
        }
    }

    return 0; // Default return value if not found (should not be reached)
  }
  printArcLengthTable() {
    let tableString = "Look-Up Table:\n";
    tableString += "u (Parametric Entry) | s (Arc Length)\n";
    this.arcLengthTable.forEach(entry => {
        tableString += `${entry.u.toFixed(3)} | ${entry.s.toFixed(3)}\n`;
    });

    // Assuming you have an output element with the id "output"
    document.getElementById("output").value = tableString;
}
  // Additional methods for arc length, load, and export can be added here...
}

// TAs implemented Curve shape class

export class Curve_Shape extends Shape {
  // curve_function: (t) => vec3
  constructor(curve_function, sample_count, curve_color=color( 1, 1, 1, 1 )) {
    super("position", "normal");

    this.material = { shader: new defs.Phong_Shader(), ambient: 1.0, color: curve_color }
    this.sample_count = sample_count;

    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = i / this.sample_count;
        this.arrays.position.push(curve_function(t));
        this.arrays.normal.push(vec3(0, 0, 0)); // have to add normal to make Phong shader work.
      }
    }
  }

  draw(webgl_manager, uniforms, transform) {
    // call super with "LINE_STRIP" mode
    super.draw(webgl_manager, uniforms, transform, this.material, "LINE_STRIP");
  }

  update(webgl_manager, uniforms, curve_function) {
    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = 1.0 * i / this.sample_count;
        this.arrays.position[i] = curve_function(t);
      }
    }
    // this.arrays.position.forEach((v, i) => v = curve_function(i / this.sample_count));
    this.copy_onto_graphics_card(webgl_manager.context);
    // Note: vertex count is not changed.
    // not tested if possible to change the vertex count.
  }
};

