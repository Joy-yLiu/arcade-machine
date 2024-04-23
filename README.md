
# Wrecking Ball Machine
CS C174C Project Report

## Members:
Mitchell Parker (005 612 231)

Joy Liu, (705 590 928)

Modhi AlMarzooqi (005 570 368)

Ethan Peng (406 004 938)


## Project Description: 
This project features an arcade game machine in which the player controls a robot arm to swing a wrecking ball around in a glass box containing small prizes. The wrecking ball is used to hit the prizes towards a chute in the corner. If a prize is knocked into a chute, the player scores a point. The goal is to knock as many prizes as you can into the chute to get the highest score possible. This project showcases various computer animation techniques such as splines, spring damping, collision detection, and inverse kinematics to simulate realistic motion and interaction in a virtual environment.

Instructions for playing game:
Move the WASD, Q, and E keys to swing the wrecking ball.

## Features:

1. Particle-spring system with wrecking ball chain:

    The particle-spring system is implemented in particle.js, spring.js, and particle_system.js. The wrecking ball chain is made up of six particles connected by damped springs, with the last particle weighing more than the other particles. In the simulation loop, the force for each particle is initialized with the gravitational force. Additional forces are then calculated with the spring force and damper force equations. We also add a force from air resistance that opposes the movement of the particle. If a collision is detected, a collision force is added (more details on collisions below). After obtaining the net force vector, symplectic Euler integration is used to calculate the new position and velocity.

2. Inverse kinematics with robot arm and controls:

    The joint hierarchies and functions for inverse kinematics are implemented in machine.js. The robot arm is made up of a base node, upper arm node, and lower arm node. Arc 1 is the joint that connects the base node and upper arm node, and Arc 2 is the joint that connects the upper arm node and lower arm node. Both Arc 1 and Arc 2 have two rotational degrees of freedom on the x and z axes. The end effector is attached to the end of the lower arm node, which is where the first particle of the wrecking ball chain is attached.

    Inverse kinematics is implemented with a loop to iteratively reduce the error between the desired end effector position. For each iteration, we calculate the Jacobian, and solve for new joint angles by applying the pseudoinverse Jacobian to a small step in position in the direction of reducing the distance error.
    
    The desired end effector position is set by the player. It is implemented with the ControlledPoint class in control-point.js. Pressing the ‘w’ ‘a’ ‘s’ ‘d’ keys moves the end effector in the x-z plane, ‘q’ moves the end position up, and ‘r’ moves the end position down. The desired end effector position is constrained by bounds so that it stays within a reasonable range of motion for the end effector.

3. Physical collisions of ball, sphere(boxes), and walls:

    We used a simple model of collisions, where the prizes and each part of the wrecking ball and chain were represented as spheres; the walls are represented as rectangular boxes. Since the walls are stationary, we have 2 types of collisions to check: sphere on sphere and sphere on cube. To check if two spheres collide, simply compare the distance between their centers against the sum of their radii. If it is less than the sum, then the spheres must be overlapping. To compute the force between the two spheres, we will have it be a spring force proportional to the difference between the sum of the radii and the distance, which is logical as the closer they are the more repulsive force they will feel. We also have a dampener force between spheres proportional to their relative velocity. For collisions with walls, we check the distance from the closest point on the wall to the center of the sphere. If this distance is less than the radius, we have a collision. We determine how far the sphere penetrates into the wall and add a spring-damper force to repel the sphere away in the direction of sphere center minus closest point on the wall. Note that this is not as simple as comparing x, y, and z coordinates independently because of what happens on edges and corners. To simulate reality better, we also have added friction forces on the walls which are perpendicular to the spring force and opposite velocity.

4. Splines in decorations:

    The decoration element consists of built-in spheres and windmill-shaped objects that move along a predefined spline path, which represents the ceiling of the claw machine.

    This animation is controlled by a simulation loop that updates the position and velocity of each object in real-time. At the core of your design is a chain of particles, each representing a different decorative element. The first particle in this chain is anchored to the end effector position of a machine, which is controlling the movement of the decorations.

    For the decorative elements, a sequence of 20 shapes were added, alternating between spheres and windmills, each following a unique path dictated by the spline. These paths are determined by different time offsets (t1, t2, t3, ..., t20), which ensure that each shape follows the spline at a slightly different phase, creating a dynamic, flowing motion.

    Each shape is transformed using matrix operations like translation, scaling, and rotation to properly position, size, and orient them in the 3D space. This includes adjusting their positions to align with the spline, scaling them down to a uniform size, and rotating the windmills to give them their distinctive shape.

    The colors of these shapes alternate in a pattern: blue, yellow, red, green, and white, adding to the visual appeal of the animation. The metallic material of these shapes likely gives them a glossy and reflective appearance, enhancing the overall aesthetic of the scene.

    As the simulation progresses (with `this.t_sim` increasing in each loop), each shape continuously follows the spline, creating the illusion of a complex, coordinated movement across the ceiling of the claw machine. This adds a lively and captivating element to your project, enriching the user's visual experience.

5. Extra Elements in Scenery:

    For an arcade-game aesthetic, colorful ‘planets’ are embedded into the side of the machine and made to revolve about each other.
    Rotating textures on the background of the claw machine display instructions for playing the game.

    An animation of randomly generated confetti shooting out of the chute is played when a box is dropped into the chute. This gives the user celebratory visual feedback for scoring a point in the game.

    In order to make the machine more animated and feel more responsive, the buttons on the machine are depressed and unpressed in accordance with the player’s control inputs. 


## Reflection:
For this project, we could’ve had better coordination on meeting plans and deadlines, as things got a bit rushed towards the end. It also would’ve helped if we asked for feedback from the TA during office hours as well.

## Future Plans:
In the future we might decide to expand on this game, as we think it is pretty exciting and cool. Maybe we even might try working on it over spring break or the summer. Our list of tasks to do include better textures, different variants of prizes, and the ability to “collect” prizes as items instead of just incrementing a score.

