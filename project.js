import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

const SPEED = 20;
const JUMPSPEED = 3;

export class Project extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.shapes = {
            /*box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),*/
            //deleted this exorcist but add a new one
            //exorcist: new Shape_From_File("assets/exorcist.obj"),
            road: new Cube(),
            leftWall: new Cube(),
            rightWall: new Cube(),
            ceiling: new Cube(),
            light: new Cube(),
            fire: new Shape_From_File("assets/fire2.obj"),
            bat: new Shape_From_File("assets/bat.obj"),
            witch: new Shape_From_File("assets/witch.obj"),
            mummy: new Shape_From_File("assets/ogre.obj"),
            ghost: new Shape_From_File("assets/ghost2.obj"),
            exorcist: new Shape_From_File("assets/exorcist2.obj"),
            text: new Text_Line(35),

        }
        // console.log(this.shapes.leftWall.arrays.texture_coord)

        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
            wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.2, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/brick_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            road: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/dungeon_floor_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            ceiling: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/ceiling.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            light: new Material(new Textured_Phong(), {
                color: hex_color("#ff0000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/lights.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            fire: new Material(new Textured_Phong(), {
                color: hex_color("#e25822"),
                ambient: 1,
                diffusivity: 0.5
            }),
            bat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
            }),
            witch: new Material(new Textured_Phong(), {
                color: hex_color("#f0f0f0"),
            }),
            mummy: new Material(new Textured_Phong(), {
                color: hex_color("#964B00"),
            }),
            text_image: new Material(new defs.Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
        }

        // this.shapes.leftWall.arrays.texture_coord = Vector.cast([0, 0], [1, 0], [0, 1], [1, 1]);

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.left = false;
        this.right = false;
        this.jump = false;
        this.isJumping = false;
        this.timeJumping = 0;
        this.crouch = 0;
        this.crouched = 0;
        this.move_distance = 0.5;

        this.ghost_transform = Mat4.identity();
        this.ghost_transform = this.ghost_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 2.5, 15));

        this.obstacles = [];
        this.ghostIsColliding = false;
        this.zeroCollisions = true;

        this.collisions = 0;
        this.gameOver = false;

        this.restarting = false;
    }

    make_control_panel() {
        this.key_triggered_button("Move left", ["a"], () => {
            this.left = true;
        }, undefined, () => {
            this.left = false;
        });
        this.key_triggered_button("Move right", ["d"], () => {
            this.right = true;
        }, undefined, () => {
            this.right = false;
        });
        this.key_triggered_button("Jump", [" "], () => {
            this.jump = true;
        }, undefined, () => {
            this.jump = false;
        });
        this.key_triggered_button("Crouch", ["c"], () => {
            this.crouch ^= 1;
        });
        this.key_triggered_button("Restart", ["r"], () => {
            this.restarting = true;
        });
    }

    display(context, program_state) {
        if (this.restarting) {
            this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
            this.left = false;
            this.right = false;
            this.jump = false;
            this.isJumping = false;
            this.timeJumping = 0;
            this.crouch = 0;
            this.crouched = 0;
            this.move_distance = 0.5;

            this.ghost_transform = Mat4.identity();
            this.ghost_transform = this.ghost_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
            this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 2.5, 15));

            this.obstacles = [];
            this.ghostIsColliding = false;
            this.zeroCollisions = true;

            this.collisions = 0;
            this.gameOver = false;

            program_state.animation_time = 0;

            this.restarting = false;
        }

        if (this.gameOver == false) {
            if (!context.scratchpad.controls) {
                this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
                // Define the global camera and projection matrices, which are stored in program_state.
                program_state.set_camera(Mat4.translation(0, -3.5, -8));
            }

            program_state.projection_transform = Mat4.perspective(
                Math.PI / 4, context.width / context.height, 1, 100);
            
            let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

            //experimented with the lighting but this def needs to be fixed
            let light_position = vec4(0, 10, 10-SPEED*t, 1);
            /*program_state.lights = [];
            program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000*t)];*/


            program_state.lights = [];

            let placeObstacle = Math.random() <= 0.02 ? true : false;
            if (placeObstacle) {
                let obstacleType = Math.floor(Math.random() * 4);
                // console.log(obstacleType);
                if (obstacleType === 0) { //fire
                    let x = Math.random() * 10 - 5;
                    let y = 2; 
                    let z = this.ghost_transform[2][3] - 75;
                    for (let i = 0; i < 5; i++) {
                        this.obstacles.push({x, y, z, type: "fire", spawn_time: t});
                        x++;
                    }
                } else if (obstacleType === 1) { //bat
                    let x = 0;
                    let y = Math.random() * 8 + 4; //somewhere in air
                    let z = this.ghost_transform[2][3] - 75;
                    this.obstacles.push({x, y, z, type: "bat", spawn_time: t});
                } else if (obstacleType === 2) { //witch
                    this.obstacles.push({x: 0, y: 2, z: this.ghost_transform[2][3] - 75, type: "witch", spawn_time: t});
                } else if (obstacleType === 3) { //mummy
                    let x = Math.random() * 10 - 5;
                    this.obstacles.push({x, y: 2, z: this.ghost_transform[2][3] - 75, type: "mummy", spawn_time: t, original_z: this.ghost_transform[2][3] - 75});
                }
            }

            for ( const obstacle of this.obstacles ) {
                if (obstacle.type === "fire") {
                    program_state.lights.push(new Light(vec4(obstacle.x, obstacle.y, obstacle.z, 1), color(.886, .345, .133, 1), 1000));
                }
            }

            for (let i = 0; i < 100; i++) {
                let light_position = vec4(0, 14, (-10*2*i)*3, 1);
                //if (Math.abs((10-SPEED*t) - (-10*2*i)) < 60) {
                    program_state.lights.push(new Light(light_position, this.zeroCollisions ? color(1, 1, 1, 1) : color(1, 0, 0, 1), 1000));
            // }
            }

            let model_transform = Mat4.identity();
            //model_transform = model_transform.times(Mat4.scale(0.25, 0.25, 0.25));
            model_transform = model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
            model_transform = model_transform.times(Mat4.translation(-this.ghost_transform[0][3], 2.5, SPEED * t - 5 + this.collisions * 10));
            this.shapes.exorcist.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffffff"), diffusivity: 1}));

            // model_transform = Mat4.identity();
            // model_transform = model_transform.times(Mat4.scale(10, 1, 1000));
            // this.shapes.road.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffff00")}));
            program_state.set_camera(Mat4.translation(0, -8, SPEED * t-15));

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(10, 1, 100000)).times(Mat4.translation(0, 15, 0));
            this.shapes.ceiling.arrays.texture_coord.forEach(
                (v, i, l) => v[1] = v[1] * 10000
            );
            this.shapes.ceiling.draw(context, program_state, model_transform, this.materials.ceiling);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(10, 1, 100000));
            this.shapes.road.arrays.texture_coord.forEach(
                (v, i, l) => v[1] = v[1] * 10000
            );
            this.shapes.road.draw(context, program_state, model_transform, this.materials.road);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(1, 10, 100000)).times(Mat4.translation(-10, 1, 0));
            this.shapes.leftWall.arrays.texture_coord.forEach(
                (v, i, l) => v[0] = v[0] * 10000
            );
            this.shapes.leftWall.draw(context, program_state, model_transform, this.materials.wall);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(1, 10, 100000)).times(Mat4.translation(10, 1, 0));
            this.shapes.rightWall.arrays.texture_coord.forEach(
                (v, i, l) => v[0] = v[0] * 10000
            );
            this.shapes.rightWall.draw(context, program_state, model_transform, this.materials.wall);

            this.zeroCollisions = true;
            for (const obstacle of this.obstacles) {
                model_transform = Mat4.identity();
                if (obstacle.type === "fire") {
                    model_transform = model_transform.times(Mat4.translation(obstacle.x, obstacle.y, obstacle.z));
                    this.shapes.fire.draw(context, program_state, model_transform, this.materials.fire);
                } else if (obstacle.type === "bat") {
                    obstacle.x = 4 * Math.sin(t - obstacle.spawn_time);
                    model_transform = model_transform.times(Mat4.translation(obstacle.x, obstacle.y, obstacle.z));
                    this.shapes.bat.draw(context, program_state, model_transform, this.materials.bat);
                } else if (obstacle.type === "witch") {
                    obstacle.x = 8 * Math.sin(t - obstacle.spawn_time);
                    model_transform = model_transform.times(Mat4.translation(obstacle.x, obstacle.y, obstacle.z));
                    this.shapes.witch.draw(context, program_state, model_transform, this.materials.witch);
                } else if (obstacle.type === "mummy") {
                    obstacle.z = obstacle.original_z + 10 * Math.sin(3 * t - obstacle.spawn_time) - 5;
                    model_transform = model_transform.times(Mat4.translation(obstacle.x, obstacle.y, obstacle.z));
                    this.shapes.mummy.draw(context, program_state, model_transform, this.materials.mummy);
                }
                if (this.ghost_transform[0][3] >= obstacle.x - 2 && this.ghost_transform[0][3] <= obstacle.x + 2 &&
                    this.ghost_transform[1][3] >= obstacle.y - 1 && this.ghost_transform[1][3] <= obstacle.y + 1 &&
                    this.ghost_transform[2][3] >= obstacle.z - 1 && this.ghost_transform[2][3] <= obstacle.z + 1) { //collision detection
                    this.zeroCollisions = false;
                    if (!this.ghostIsColliding) { //only detects collision once
                        this.ghostIsColliding = true;
                        console.log("collision detected");
                        this.collisions++;
                        if (this.collisions >= 2) {
                            this.gameOver = true;
                        }

                    }
                }
            }
            if (this.zeroCollisions) {
                this.ghostIsColliding = false;
                this.zeroCollisions = true;
            }


            if (this.obstacles.length >= 1) {
                // console.log("z: ", this.obstacles[0].z);
            }
            if (this.obstacles.length >= 1 && this.obstacles[0].z > this.ghost_transform[2][3] + 30) {
                // console.log("removed");
                this.obstacles.shift();
            }
            // console.log("num elem: ", this.obstacles.length);



            // let ghost_transform = Mat4.identity();
            //model_transform = model_transform.times(Mat4.scale(0.25, 0.25, 0.25));
            //this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 0, SPEED * dt));
            if (this.crouched == 0) {
                this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 0, SPEED * dt));
            }
            else {
                this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, SPEED*dt, 0));
            }
            if (this.left && this.ghost_transform[0][3] >= -6.7) { //can't go further left than x=-10
                this.ghost_transform = this.ghost_transform.times(Mat4.translation(this.move_distance, 0, 0)); //+x is left bc ghost is flipped 180 deg
            }
            if (this.right && this.ghost_transform[0][3] <= 7.0) { //can't go further right than x=10
                this.ghost_transform = this.ghost_transform.times(Mat4.translation(-this.move_distance, 0, 0));
            }
            // console.log(this.ghost_transform[1][3])

            //jumping physics

            if (this.ghost_transform[1][3] <= 2.5){ //if player is on ground
                if (this.crouch == 1 && this.crouched == 0) {
                    this.ghost_transform = this.ghost_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0));
                    this.crouch = 0;
                    this.crouched = 1;
                    this.move_distance = 0.25;
                }
                else if (this.crouch == 1 && this.crouched == 1) {
                    this.ghost_transform = this.ghost_transform.times(Mat4.rotation(-Math.PI/2, 1, 0, 0));
                    this.crouch = 0;
                    this.crouched = 0;
                    this.move_distance = 0.5;
                }
                if (this.isJumping) { //no longer jumping when landed back on ground
                    this.isJumping = false;
                }
                if (this.crouched == 0) {
                    if (this.jump) { //can't start jumping unless on the ground and player presses space
                        this.timeJumping = 0; //this is used as "t" value in x0 + v0t -0.5at^2, must be reset every time new jump initiated
                        this.isJumping = true;
                    }
                }
            }
            else {
                this.crouch = 0;
            }
            if (this.isJumping) {
                this.timeJumping += dt;
                let y = Math.max(2.5, 2.5 + 10 * JUMPSPEED * this.timeJumping - 0.5 * 9.8 * JUMPSPEED ** 2 * this.timeJumping ** 2) //set y coord to new position based on kinematics, also make sure y pos never clips into ground (below 2.5)
                this.ghost_transform[1][3] = y; 
            }

            for (let i = 0; i < 100; i++) {

                model_transform = Mat4.identity();
                model_transform = model_transform.times(Mat4.scale(3, 1, 3)).times(Mat4.translation(0, 14, -10*2*i));
                this.shapes.light.draw(context, program_state, model_transform, this.materials.light.override({color: this.zeroCollisions ? hex_color("#101010") : hex_color("#ff0000")}));
                model_transform = vec4(0, 14, -10 * 3 * i, 1);
                // program_state.lights.push(new Light(model_transform, color(1, 1, 1, 1), 1000 * t));

            }

            this.shapes.ghost.draw(context, program_state, this.ghost_transform, this.materials.phong.override({color: this.zeroCollisions ? hex_color("#ffffff") : hex_color("#ff0000")}));
        }
    else {
        program_state.lights = [new Light(vec4(3, 2, 1, 0), color(1, 1, 1, 1), 1000000),
            new Light(vec4(3, 10, 10, 1), color(1, .7, .7, 1), 100000)];
        program_state.set_camera(Mat4.look_at(...Vector.cast([0, 0, 4], [0, 0, 0], [0, 1, 0])));
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(2, 2, 2));
        model_transform = model_transform.times(Mat4.translation(-1/1.5, 1/6, 0));
        this.shapes.text.set_string("Game Over", context.context);
        this.shapes.text.draw(context, program_state, model_transform.times(Mat4.scale(.09, .09, .09)), this.materials.text_image);
        this.shapes.text.set_string("Press R to play again", context.context);
        model_transform = model_transform.times(Mat4.translation(-1/1.5, -1/4, 0));
        this.shapes.text.draw(context, program_state, model_transform.times(Mat4.scale(.09, .09, .09)), this.materials.text_image);
    }
    }
}

