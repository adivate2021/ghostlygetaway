import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

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

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
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
            ghost: new Shape_From_File("assets/ghost2.obj"),
            exorcist: new Shape_From_File("assets/exorcist2.obj"),

        }
        console.log(this.shapes.leftWall.arrays.texture_coord)


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
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
                ambient: 0.5, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/brick_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            road: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/dungeon_floor_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            ceiling: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/ceiling.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            light: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/lights.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
        }

        // this.shapes.leftWall.arrays.texture_coord = Vector.cast([0, 0], [1, 0], [0, 1], [1, 1]);

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.left = false;
        this.right = false;
        this.jump = false;
        this.isJumping = false;
        this.timeJumping = 0;

        this.ghost_transform = Mat4.identity();
        this.ghost_transform = this.ghost_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 2.5, 15));
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
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
    }

    display(context, program_state) {
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
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000*t)];
        //program_state.lights = [new Light(light_position, color(t, t, t, t), 1000*t)];

        let model_transform = Mat4.identity();
        //model_transform = model_transform.times(Mat4.scale(0.25, 0.25, 0.25));
        model_transform = model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        model_transform = model_transform.times(Mat4.translation(0, 2.5, SPEED * t));
        this.shapes.exorcist.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#964b00")}));

        // model_transform = Mat4.identity();
        // model_transform = model_transform.times(Mat4.scale(10, 1, 1000));
        // this.shapes.road.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffff00")}));
        program_state.set_camera(Mat4.translation(0, -8, SPEED * t-15));

        for (let i = 0; i < 100; i++) {

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(3, 1, 3)).times(Mat4.translation(0, 14, -10*i));
            this.shapes.ceiling.draw(context, program_state, model_transform, this.materials.light);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(10, 1, 10)).times(Mat4.translation(0, 15, -2*i));
            this.shapes.ceiling.draw(context, program_state, model_transform, this.materials.ceiling);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(10, 1, 10)).times(Mat4.translation(0, 0, -2*i));
            this.shapes.road.draw(context, program_state, model_transform, this.materials.road);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(1, 10, 10)).times(Mat4.translation(-10, 1, -2*i));
            this.shapes.leftWall.draw(context, program_state, model_transform, this.materials.wall);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(1, 10, 10)).times(Mat4.translation(10, 1, -2*i));
            this.shapes.rightWall.draw(context, program_state, model_transform, this.materials.wall);
        }

        // let ghost_transform = Mat4.identity();
        //model_transform = model_transform.times(Mat4.scale(0.25, 0.25, 0.25));
        this.ghost_transform = this.ghost_transform.times(Mat4.translation(0, 0, SPEED * dt));
        if (this.left && this.ghost_transform[0][3] >= -6.8) { //can't go further left than x=-10
            this.ghost_transform = this.ghost_transform.times(Mat4.translation(1, 0, 0)); //+x is left bc ghost is flipped 180 deg
        }
        if (this.right && this.ghost_transform[0][3] <= 7.0) { //can't go further right than x=10
            this.ghost_transform = this.ghost_transform.times(Mat4.translation(-1, 0, 0));
        }
        console.log(this.ghost_transform[1][3])

        //jumping physics

        if (this.ghost_transform[1][3] <= 2.5){ //if player is on ground
            if (this.isJumping) { //no longer jumping when landed back on ground
                this.isJumping = false;
            }
            if (this.jump) { //can't start jumping unless on the ground and player presses space
                this.timeJumping = 0; //this is used as "t" value in x0 + v0t -0.5at^2, must be reset every time new jump initiated
                this.isJumping = true;
            }
        }
        if (this.isJumping) {
            this.timeJumping += dt;
            let y = Math.max(2.5, 2.5 + 10 * JUMPSPEED * this.timeJumping - 0.5 * 9.8 * JUMPSPEED ** 2 * this.timeJumping ** 2) //set y coord to new position based on kinematics, also make sure y pos never clips into ground (below 2.5)
            this.ghost_transform[1][3] = y; 
        }

        this.shapes.ghost.draw(context, program_state, this.ghost_transform, this.materials.phong.override({color: hex_color("#ffffff")}))
    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

