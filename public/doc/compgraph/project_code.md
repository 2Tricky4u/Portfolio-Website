# Project code
## What's inside?
toon/outline/heat.glsl
render.js
actor/face_buffer.js
normal_computation.js
scene_content.js
main.js (camera, inputs, ui)
menu.js
colorUtils.js

NOTE: none of the obj are in this file, some obj are made by us, other are taken from internet
## Shaders (glsl)
### Toon
#### toon.frag.glsl
```glsl
precision mediump float;

#define LIGHT_COUNT 3

varying vec3 v2f_dir_from_view;
varying vec3 v2f_normal;

varying vec3 v2f_dir_to_light1;
varying vec3 v2f_dir_to_light2;
varying vec3 v2f_dir_to_light3;

uniform vec3 light_color_1;
uniform vec3 light_color_2;
uniform vec3 light_color_3;

uniform vec3 material_color;
uniform float material_shininess;

uniform int ambient_color_number;
uniform int diffuse_color_number;
uniform int specular_color_number;

uniform float min_ambient_intensity;
uniform float max_ambient_intensity;
uniform float min_diffuse_intensity;
uniform float max_diffuse_intensity;
uniform float min_specular_intensity;
uniform float max_specular_intensity;

uniform vec3 ambient_hue_color;
uniform vec3 diffuse_hue_color;
uniform vec3 specular_hue_color;

uniform float ambient_hue_intensity;
uniform float diffuse_hue_intensity;
uniform float specular_hue_intensity;

uniform float ambient_intensity;
uniform float diffuse_intensity;
uniform float specular_intensity;

uniform vec3 shadow_part_color;
uniform vec3 color_shift;

/*
* Returns a float between 0. and 1. depending on the attenuation (between 0. and 1.) and the number
* of quantization levels > 0.
*/
float quantize_value(int levels, float value, float min_intensity, float max_intensity) {
	float diff = max_intensity - min_intensity;
	return ((ceil(float(levels)*value)/float(levels)) * diff) + min_intensity;
}

void main()
{
	float material_ambient = 0.1;

	// =================================================
	// GENERAL
	// =================================================

	vec3 color = vec3(0.);

	float ambient = ambient_intensity;
	float diffuse = diffuse_intensity;
	float specular = specular_intensity;

	vec3 n_dir_from_view = normalize(v2f_dir_from_view);
	vec3 n_normal = normalize(v2f_normal);

	// =================================================
	// SHADOW
	// =================================================

	float nl[LIGHT_COUNT];

    nl[0] = dot(n_normal, normalize(v2f_dir_to_light1));
    nl[1] = dot(n_normal, normalize(v2f_dir_to_light2));
    nl[2] = dot(n_normal, normalize(v2f_dir_to_light3));
    bool is_shadow = true;

    for (int i = 0; i < LIGHT_COUNT; i++) {
        if(nl[i] >= 0.) {
            is_shadow = false;
        }
    }
	// if nl < 0, then light is behind object, should not be taken into account
	if (is_shadow) {
		// only return ambiant light, if behind
		gl_FragColor = vec4(shadow_part_color, 1.);
		return;
	}

	// =================================================
	// AMBIENT
	// =================================================

	vec3 teint_m = ambient_hue_color;
	float teint_intensity_m = ambient_hue_intensity;
	vec3 mat_teint_m = material_color * (1. - teint_intensity_m) + teint_intensity_m * teint_m;

	vec3 mat_color = mat_teint_m * quantize_value(ambient_color_number, nl[0], min_ambient_intensity, max_ambient_intensity);

	color = ambient * mat_color;

	// =================================================
	// DIFFUSE
	// =================================================

	vec3 teint_d = diffuse_hue_color;
	float teint_intensity_d = diffuse_hue_intensity;
	vec3 mat_teint_d = material_color * (1. - teint_intensity_d) + teint_intensity_d * teint_d;

	vec3 diff_color = vec3(0.);
	diff_color += light_color_1 * mat_teint_d * nl[0];
    diff_color += light_color_2 * mat_teint_d * nl[1];
    diff_color += light_color_3 * mat_teint_d * nl[2];
    diff_color = clamp(diff_color, 0., 1.);
	diff_color *= quantize_value(diffuse_color_number, nl[0], min_diffuse_intensity, max_diffuse_intensity);

	color += diffuse*diff_color;

	// =================================================
	// SPECULAR
	// =================================================

	float hn[LIGHT_COUNT];

    hn[0] = dot(normalize(v2f_dir_to_light1 + n_dir_from_view), n_normal);
    hn[1] = dot(normalize(v2f_dir_to_light2 + n_dir_from_view), n_normal);
    hn[2] = dot(normalize(v2f_dir_to_light3 + n_dir_from_view), n_normal);

    bool is_inside = true;

    for (int i = 0; i < LIGHT_COUNT; i++) {
        if (hn[i] >= 0.) {
            is_inside = false;
        }
    }

	if (is_inside) {
		//TODO what to return here on color?
		gl_FragColor = vec4(color, 1.);
		return;
	}

	vec3 teint_s = specular_hue_color;
	float teint_intensity_s = specular_hue_intensity;
	vec3 mat_teint_s = material_color * (1. - teint_intensity_s) + teint_intensity_s * teint_s;

	float quantized_hn_0 = quantize_value(specular_color_number, hn[0], min_specular_intensity, max_specular_intensity);
	float quantized_hn_1 = quantize_value(specular_color_number, hn[1], min_specular_intensity, max_specular_intensity);
	float quantized_hn_2 = quantize_value(specular_color_number, hn[2], min_specular_intensity, max_specular_intensity);

	vec3 spec_color = vec3(0.);
	spec_color += light_color_1 * mat_teint_s * pow(quantized_hn_0, material_shininess);
    spec_color += light_color_2 * mat_teint_s * pow(quantized_hn_1, material_shininess);
    spec_color += light_color_3 * mat_teint_s * pow(quantized_hn_2, material_shininess);
    spec_color = clamp(spec_color, 0., 1.);

	color += specular*spec_color;

	// =================================================
	// EXPERIMENTAL
	// =================================================

	float factor = ambient * (max_ambient_intensity - min_ambient_intensity) + diffuse * (max_diffuse_intensity - min_diffuse_intensity) + specular * (max_specular_intensity - min_specular_intensity);
	color = color / factor;

	float r = color.x + color_shift.r;
	float r_off= floor(r);
	if(r > 1.) {
		r -= r_off;
	}

	float g = color.y + color_shift.g;
	float g_off= floor(g);
	if(g > 1.) {
		g -= g_off;
	}

	float b = color.z + color_shift.b;
	float b_off= floor(b);
	if(b > 1.) {
		b -= b_off;
	}
	color = vec3(r, g, b);

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}

```










#### toon.vert.glsl
```glsl
// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
varying vec3 v2f_dir_from_view;
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light1;
varying vec3 v2f_dir_to_light2;
varying vec3 v2f_dir_to_light3;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position_1;
uniform vec3 light_position_2;
uniform vec3 light_position_3;


void main() {

	// transform normal to camera coordinates
	v2f_normal = normalize(mat_normals_to_view * vertex_normal);

	// direction to light source
	vec4 position = mat_model_view * vec4(vertex_position, 1.); // position in camera space
	v2f_dir_to_light1 = normalize(light_position_1 - position.xyz);
	v2f_dir_to_light2 = normalize(light_position_2 - position.xyz);
	v2f_dir_to_light3 = normalize(light_position_3 - position.xyz);

	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	v2f_dir_from_view = normalize(vec3(0.) - position.xyz);

	gl_Position = mat_mvp * vec4(vertex_position, 1.);
}
```

















### Heat
#### heat.frag.glsl
```glsl
precision mediump float;

varying vec3 v2f_normal;
varying float v2f_light_distance1;
varying float v2f_light_distance2;
varying float v2f_light_distance3;

varying vec3 v2f_dir_to_light1;
varying vec3 v2f_dir_to_light2;
varying vec3 v2f_dir_to_light3;

uniform vec3 warm_color;
uniform vec3 cold_color;
uniform float light_factor;
uniform bool quantize_heat;
uniform int quantize_level;
uniform float distance_heat;

/*
* Returns a float between 0. and 1. depending on the attenuation (between 0. and 1.) and the number
* of quantization levels > 0.
*/
float quantize_value(int levels, float value) {
    return ceil(float(levels)*value)/float(levels);
}

void main() {

    // =================================================
    // GENERAL
    // =================================================

    vec3 n_normal = normalize(v2f_normal);
    vec3 n_dir_to_light1 = normalize(v2f_dir_to_light1);
    vec3 n_dir_to_light2 = normalize(v2f_dir_to_light2);
    vec3 n_dir_to_light3 = normalize(v2f_dir_to_light3);

    // =================================================
    // HEAT COLOR (LIGHT DISTANCE)
    // =================================================

    float dist_factor_1 = 1. - v2f_light_distance1 / light_factor;
    float dist_factor_2 = 1. - v2f_light_distance2 / light_factor;
    float dist_factor_3 = 1. - v2f_light_distance3 / light_factor;

    if(quantize_heat) {
        dist_factor_1 = quantize_value(quantize_level, dist_factor_1);
        dist_factor_2 = quantize_value(quantize_level, dist_factor_2);
        dist_factor_3 = quantize_value(quantize_level, dist_factor_3);
    }


    // =================================================
    // HEAT COLOR (LIGHT DIRECTION)
    // =================================================

    float nl_1 = dot(n_normal, n_dir_to_light1);
    float nl_2 = dot(n_normal, n_dir_to_light2);
    float nl_3 = dot(n_normal, n_dir_to_light3);
    if(nl_1 < 0.) { nl_1 = 0.; }
    if(nl_2 < 0.) { nl_2 = 0.; }
    if(nl_3 < 0.) { nl_3 = 0.; }

    if(quantize_heat) {
        nl_1 = quantize_value(quantize_level, nl_1);
        nl_2 = quantize_value(quantize_level, nl_2);
        nl_3 = quantize_value(quantize_level, nl_3);
    }

    // =================================================
    // FINAL COLOR
    // =================================================

    float temp_1 = dist_factor_1*distance_heat + nl_1*(1. - distance_heat);
    float temp_2 = dist_factor_2*distance_heat + nl_2*(1. - distance_heat);
    float temp_3 = dist_factor_3*distance_heat + nl_3*(1. - distance_heat);
    float global_temp = (temp_1 + temp_2 + temp_3)/3.;

    vec3 color = global_temp*warm_color + (1. - global_temp)*cold_color;
    gl_FragColor = vec4(color, 1.);
}
```
























#### heat.vert.glsl
```glsl
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

varying vec3 v2f_normal;
varying float v2f_light_distance1;
varying float v2f_light_distance2;
varying float v2f_light_distance3;

varying vec3 v2f_dir_to_light1;
varying vec3 v2f_dir_to_light2;
varying vec3 v2f_dir_to_light3;

uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position_1;
uniform vec3 light_position_2;
uniform vec3 light_position_3;

void main() {

    // transform normal to camera coordinates
	v2f_normal = normalize(mat_normals_to_view * vertex_normal);

	// direction to light source
	vec4 position = mat_model_view * vec4(vertex_position, 1.);
	v2f_light_distance1 = length(light_position_1 - position.xyz);
	v2f_light_distance2 = length(light_position_2 - position.xyz);
	v2f_light_distance3 = length(light_position_3 - position.xyz);

	v2f_dir_to_light1 = normalize(light_position_1 - position.xyz);
	v2f_dir_to_light2 = normalize(light_position_2 - position.xyz);
	v2f_dir_to_light3 = normalize(light_position_3 - position.xyz);

    gl_Position = mat_mvp * vec4(vertex_position, 1.);
}
```



### Outline & filters
#### outline.frag.glsl
```glsl
precision highp float;

uniform sampler2D actor_buffer;
uniform sampler2D face_buffer;
uniform sampler2D color_buffer;

uniform int buffer_width;
uniform int buffer_height;

#define THICKNESS_MAX 16
uniform int outline_thickness;
uniform vec3 outline_color;

uniform float filter_effect;
uniform bool filter_negative;
uniform bool filter_bw;
uniform bool filter_color_bool;
uniform vec3 filter_color;
uniform bool color_lines;
uniform float color_lines_opacity;

vec2 buffer_pos(int x_pix_off, int y_pix_off) {
    float x_pix_pos = gl_FragCoord.x + float(x_pix_off);
    float y_pix_pos = gl_FragCoord.y + float(y_pix_off);

    return vec2(x_pix_pos/float(buffer_width), y_pix_pos/float(buffer_height));
}


void main() {

    vec2 pos = buffer_pos(0, 0);

    /* -------------
        Colors
    ------------- */

    vec3 color = texture2D(color_buffer, pos).rgb;

    /* -------------
        Outline
    ------------- */

    int ot_mid = outline_thickness/2;
    float thresh = 1e-6;
    float actor_gray = texture2D(actor_buffer, pos).r;
    float face_gray = texture2D(face_buffer, pos).r;

    for(int i = 0; i < THICKNESS_MAX; i++) {
        for(int j = 0; j < THICKNESS_MAX; j++) {
            if(i < outline_thickness && j < outline_thickness) {
                vec2 off_pos = buffer_pos(i-ot_mid, j-ot_mid);
                float off_gray_actor = texture2D(actor_buffer, off_pos).r;
                float off_gray_face = texture2D(face_buffer, off_pos).r;
                vec3 off_color = texture2D(color_buffer, off_pos).rgb;

                if(length(color-off_color) > thresh && color_lines) {
                    color *= (1. - color_lines_opacity / 30.);
                }

                if(abs(off_gray_actor-actor_gray) > thresh) {
                    color = outline_color;
                }

                if(abs(off_gray_face-face_gray) > thresh) {
                    color = outline_color;
                }
            }
        }
    }

    /* -------------
        Filters
    ------------- */

    vec3 filtered_color = color;

    if(filter_bw) {
        float intensity = length(color);
        const float bw_thresh = 0.5;
        if(intensity < bw_thresh) {
            filtered_color = vec3(0.);
        } else {
            filtered_color = vec3(1.);
        }
        //filtered_color = vec3(length(color));
    }

    if(filter_color_bool) {
        filtered_color = length(color)*filter_color;
    }

    if(filter_negative) {
        filtered_color = 1. - filtered_color;
    }

    if(filter_negative || filter_color_bool || filter_bw) {
        color = filter_effect*filtered_color + (1. - filter_effect)*color;
    }

    gl_FragColor = vec4(color, 1.);
}
```













## Pipeline & buffers (js)
### rendering
The whole file render.js is inspired from the course homework file "mesh_render.js"
However we introduced the wanted uniforms and the frame buffers needed.

```js
import {vec2, vec3, vec4, mat3, mat4} from "./index.js"
import {ActorBuffer} from "./buffers/actor_buffer.js"
import {FaceBuffer} from "./buffers/face_buffer.js"
import {mat4_matmul_many} from "./icg_math.js"

/*
    Draw meshes with a given shading
*/
class SysRender {

    /* -----------------------
        Initialization
    ----------------------- */

    static shader_name = ''

    constructor(regl, resources, canvas) {
        // Keep a reference to textures
        this.regl = regl
        this.resources = resources

        // Buffers
        this.actor_capture = new ActorBuffer(regl, resources, canvas)
        this.face_capture = new FaceBuffer(regl, resources, canvas)
        this.color_buffer = regl.framebuffer({
            width: canvas.width,
            height: canvas.height,
            colorFormat: 'rgba',
            colorType: 'uint8',
            stencil: false,
            depth: true,
            depthTexture: true,
            mag: 'linear',
            min: 'linear',
            depthType: 'float32',
        })

        this.init_pipeline(regl)

        this.destroyer_motor_vib = 1
    }

    toggle_motor() {
        this.destroyer_motor_vib++
        this.destroyer_motor_vib %= 2
    }

    init_pipeline(regl) {

        const shader_name = this.constructor.shader_name

        /* -----------------------
            Pipelines
        ----------------------- */

        // ================================= COLOR PIPELINE

        this.color_pipeline = regl({
            attributes: {
                vertex_position: regl.prop('mesh.vertex_positions'),
                vertex_normal: regl.prop('mesh.vertex_normals')
            },
            // Faces, as triplets of vertex indices
            elements: regl.prop('mesh.faces'),

            // Uniforms: global data available to the shader
            uniforms: this.pipeline_uniforms(regl),

            vert: this.get_resource_checked(`shaders/${shader_name}.vert.glsl`),
            frag: this.get_resource_checked(`shaders/${shader_name}.frag.glsl`),

            framebuffer: this.color_buffer
        })

        // ================================= OUTLINE PIPELINE

        this.outline_pipeline = regl({
            attributes: {
                vertex_position: regl.prop('mesh.vertex_positions'),
                vertex_normal: regl.prop('mesh.vertex_normals'),
            },
            // Faces, as triplets of vertex indices
            elements: regl.prop('mesh.faces'),

            // Uniforms: global data available to the shader
            uniforms: this.pipeline_uniforms(regl),

            vert: this.get_resource_checked(`shaders/outline.vert.glsl`),
            frag: this.get_resource_checked(`shaders/outline.frag.glsl`)
        })
    }


    pipeline_uniforms(regl) {
        return {
            mat_mvp: regl.prop('mat_mvp'),
            mat_model_view: regl.prop('mat_model_view'),
            mat_normals_to_view: regl.prop('mat_normals_to_view'),

            light_position_1: regl.prop('lights[0].light_position_cam'),
            light_position_2: regl.prop('lights[1].light_position_cam'),
            light_position_3: regl.prop('lights[2].light_position_cam'),
            light_color_1: regl.prop('lights[0].light_color'),
            light_color_2: regl.prop('lights[1].light_color'),
            light_color_3: regl.prop('lights[2].light_color'),

            material_color: regl.prop('material.color'),
            material_shininess: regl.prop('material.shininess'),

            ambient_color_number: regl.prop('color_number.ambient_color_number'),
            diffuse_color_number: regl.prop('color_number.diffuse_color_number'),
            specular_color_number: regl.prop('color_number.specular_color_number'),
            min_ambient_intensity: regl.prop('min_max_intensity.min_ambient_intensity'),
            max_ambient_intensity: regl.prop('min_max_intensity.max_ambient_intensity'),
            min_diffuse_intensity: regl.prop('min_max_intensity.min_diffuse_intensity'),
            max_diffuse_intensity: regl.prop('min_max_intensity.max_diffuse_intensity'),
            min_specular_intensity: regl.prop('min_max_intensity.min_specular_intensity'),
            max_specular_intensity: regl.prop('min_max_intensity.max_specular_intensity'),
            ambient_hue_color: regl.prop('color_hue.ambient_hue_color'),
            diffuse_hue_color: regl.prop('color_hue.diffuse_hue_color'),
            specular_hue_color: regl.prop('color_hue.specular_hue_color'),
            ambient_hue_intensity: regl.prop('color_hue.ambient_hue_intensity'),
            diffuse_hue_intensity: regl.prop('color_hue.diffuse_hue_intensity'),
            specular_hue_intensity: regl.prop('color_hue.specular_hue_intensity'),
            ambient_intensity: regl.prop('intensity.ambient_intensity'),
            diffuse_intensity: regl.prop('intensity.diffuse_intensity'),
            specular_intensity: regl.prop('intensity.specular_intensity'),
            shadow_part_color: regl.prop('general.shadow_part_color'),
            color_shift: regl.prop('general.color_shift'),

            // OUTLINE
            outline_color: regl.prop('outline.outline_color'),
            outline_thickness: regl.prop('outline.outline_thickness'),

            // WINDOW INFORMATION
            buffer_width: regl.prop('actor_buffer.width'),
            buffer_height: regl.prop('actor_buffer.height'),

            // BUFFERS
            actor_buffer: regl.prop('actor_buffer'),
            face_buffer: regl.prop('face_buffer'),
            color_buffer: regl.prop('color_buffer'),

            // HEATMAP_GENERAL
            warm_color: regl.prop('heatmap_general.warm_color'),
            cold_color: regl.prop('heatmap_general.cold_color'),
            light_factor: regl.prop('heatmap_general.light_factor'),
            quantize_heat: regl.prop('heatmap_general.quantize_heat'),
            quantize_level: regl.prop('heatmap_general.quantize_level'),
            distance_heat: regl.prop('heatmap_general.distance_heat'),

            // FILTER
            filter_effect: regl.prop('filter.filter_effect'),
            filter_negative: regl.prop('filter.filter_negative'),
            filter_bw: regl.prop('filter.filter_bw'),
            filter_color_bool: regl.prop('filter.filter_color_bool'),
            filter_color: regl.prop('filter.filter_color'),
            color_lines: regl.prop('filter.color_lines'),
            color_lines_opacity: regl.prop('filter.color_lines_opacity'),
        }
    }

    /* -----------------------
        Helpers
    ----------------------- */

    get_resource_checked(shader_name) {
        const shader_text = this.resources[shader_name]
        if (shader_text === undefined) {
            throw new ReferenceError(`No resource ${shader_name}`)
        }
        return shader_text
    }

    /* -----------------------
          Buffer Capture
      ----------------------- */

    capture_color_buffer(entries_to_draw) {
        this.regl.clear({
            framebuffer: this.color_buffer,
            color: [0, 0, 0, 1],
            depth: 1,
        })

        this.color_pipeline(entries_to_draw)
        return this.color_buffer
    }

    /* -----------------------
        Rendering
    ----------------------- */

    render(frame_info, scene_info) {
        /*
        We will collect all objects to draw with this pipeline into an array
        and then run the pipeline on all of them.
        This way the GPU does not need to change the active shader between objects.
        */
        const entries_to_draw = []

        // Read frame info
        const {
            mat_projection,
            mat_view,
            lights,
            color_number,
            min_max_intensity,
            color_hue,
            intensity,
            general,
            outline,
            heatmap_general,
            filter
        } = frame_info

        // For each scene objects, construct information needed to draw it using the pipeline
        for (const actor of scene_info.actors) {

            // Construct mat_model_to_world from translation and sclae
            // If we wanted to have a rotation too, we'd use mat4.fromRotationTranslationScale
            mat4.fromScaling(actor.mat_model_to_world, actor.scale)
            mat4.translate(actor.mat_model_to_world, actor.mat_model_to_world, actor.translation)

            if (actor.mesh === 'small_destroyer.obj') {
                mat4.translate(
                    actor.mat_model_to_world,
                    actor.mat_model_to_world,
                    [
                        (frame_info.sim_time * -1.) / actor.scale[0],
                        this.destroyer_motor_vib * (Math.random() - 0.5) * 0.0025,
                        this.destroyer_motor_vib * (Math.random() - 0.5) * 0.0035
                    ])
            }

            if (actor.mesh === "death_star.obj") {
                mat4.rotateZ(
                    actor.mat_model_to_world,
                    actor.mat_model_to_world,
                    frame_info.sim_time * -0.1
                )
            }

            if (actor.mesh === "AtAt_s.obj") {
                mat4.rotateZ(
                    actor.mat_model_to_world,
                    actor.mat_model_to_world,
                    0.7
                )
            }

            if (actor.mesh === "tie.obj") {
                const m_dir = mat4.fromZRotation(mat4.create(), -Math.PI / 2)

                const m_rad = mat4.fromTranslation(mat4.create(), [8., 0, 0])

                const m_rot = mat4.fromZRotation(mat4.create(), frame_info.sim_time * 0.4 + 0.1)

                const m_scale = mat4.fromScaling(mat4.create(), [0.2, 0.2, 0.2])

                mat4_matmul_many(actor.mat_model_to_world, actor.mat_model_to_world, m_rot, m_rad, m_scale, m_dir)
            }

            const mat_model_view = mat4.create()
            const mat_mvp = mat4.create()
            const mat_normals_to_view = mat3.create()
            mat3.identity(mat_normals_to_view)

            mat4_matmul_many(mat_mvp, mat_projection, mat_view, actor.mat_model_to_world)
            mat4_matmul_many(mat_model_view, mat_view, actor.mat_model_to_world)

            const mat_model_view3 = mat3.fromMat4([0, 0, 0], mat_model_view)
            mat3.transpose(mat_normals_to_view, mat_model_view3)
            mat3.invert(mat_normals_to_view, mat_normals_to_view)

            entries_to_draw.push({
                mesh: this.resources[actor.mesh],
                mat_mvp: mat_mvp,
                mat_model_view: mat_model_view,
                mat_normals_to_view: mat_normals_to_view,

                lights,

                material: actor.material,

                color_number,
                min_max_intensity,
                color_hue,
                intensity,
                general,
                outline,
                heatmap_general,
                filter
            })
        }

        // Fill the buffers
        const actor_buffer = this.actor_capture.capture_into_buffer(entries_to_draw)
        const face_buffer = this.face_capture.capture_into_buffer(entries_to_draw)
        const color_buffer = this.capture_color_buffer(entries_to_draw)

        // Add buffers to pipeline
        const entries_with_buffer = entries_to_draw.map(entry => {
            return {
                ...entry,
                actor_buffer: actor_buffer,
                face_buffer: face_buffer,
                color_buffer: color_buffer
            }
        })

        // Set the whole image to black
        this.regl.clear({color: [0.01, 0.05, 0.25, 1]});

        // Draw on the GPU
        this.outline_pipeline(entries_with_buffer)

    }
}

/*
    Exported classes
*/
export class SysRenderToon extends SysRender {
    static shader_name = 'toon'
}

/*
    Exported classes
*/
export class SysRenderHeat extends SysRender {
    static shader_name = 'heat'
}
```








### actor/face_buffer.js
These two files are very simple and similar so we just present actor_buffer.js,
that defines the behavior of the framebuffer storing the different actors of the
scene.


```js
import {vec3} from "../../lib/gl-matrix_3.3.0/esm/index.js";


export class ActorBuffer {

    /* -----------------------
        Initialization
    ----------------------- */

    constructor(regl, resources, canvas) {
        this.regl = regl
        this.resources = resources
        this.buffer = regl.framebuffer({
            width: canvas.width,
            height: canvas.height,
            colorFormat: 'rgba',
            colorType: 'uint8',
            stencil: false,
            depth: true,
            depthTexture: true,
            mag: 'linear',
            min: 'linear',
            depthType: 'float32',
        })
        this.grey_start = vec3.fromValues(0.1, 0.1, 0.1)
        this.init_pipeline(regl)
    }

    init_pipeline = (regl) => {
        this.pipeline = regl({
            attributes: {
                vertex_position: regl.prop('mesh.vertex_positions'),
            },
            // Faces, as triplets of vertex indices
            elements: regl.prop('mesh.faces'),

            // Uniforms: global data available to the shader
            uniforms: {
                mat_mvp: regl.prop('mat_mvp'),
                material_color: regl.prop('material.color')
            },

            vert: this.resources['buffers/actor_buffer.vert.glsl'],
            frag: this.resources['buffers/actor_buffer.frag.glsl'],

            framebuffer: this.buffer,
            depth: {
                enable: true,
                mask: true,
            },
        })
    }


    /* -----------------------
        Buffer capture
    ----------------------- */

    capture_into_buffer(entries_to_draw) {
        this.regl.clear({
            framebuffer: this.buffer,
            color: [0, 0, 0, 1],
            depth: 1,
        })

        const grey_factor = 0.05

        const entries_new_color = entries_to_draw.map((entry, idx) => {
            const mat = JSON.parse(JSON.stringify(entry.material))
            vec3.scale(mat.color, this.grey_start, grey_factor * (idx + 1))
            return {
                ...entry,
                material: mat
            }
        })

        this.pipeline(entries_new_color)

        return this.buffer
    }

}
```

### Face id algorithm
Functions in normal_computation.js to assign an id to similar faces of the meshes
```js
export function mesh_preprocess(regl, mesh) {
	const [tri_normals, angle_weights] = compute_triangle_normals_and_angle_weights(mesh)

	const vertex_normals = compute_vertex_normals(mesh, tri_normals, angle_weights)

	const colorGenerator = new UniqueColorGenerator()

	const vertexFaceColors =
			faceIds(mesh.faces, mesh.vertex_positions.length / 3)
			.map(idx => colorGenerator.nextColor(idx))
			.map((c) => {return [c.r, c.g, c.b]}).flat()

	mesh.vertex_face_color = regl.buffer({data: vertexFaceColors})
	mesh.vertex_positions = regl.buffer({data: mesh.vertex_positions, type: 'float32'})
	mesh.vertex_normals = regl.buffer({data: vertex_normals, type: 'float32'})
	mesh.faces = regl.elements({data: mesh.faces, type: 'uint16'})

	return mesh
}

/**
 * Method to assign an id to each face, and then assign this id to every vertex that compose this face
 */
const faceIds = (faces, nbVertices) => {
	let surfaceId = 1;
	const visitedFaces = new Set();
	const faceAdjacency = computeFaceAdjacency(faces)
	const vertexIds = new Array(nbVertices).fill(0)

	const num_faces    = (faces.length / 3) | 0

	for (let faceIndex = 0; faceIndex < num_faces; faceIndex++) {
		if (!visitedFaces.has(faceIndex)) {
			assignSimilarFaces(faceIndex, surfaceId, visitedFaces, faceAdjacency, vertexIds, faces)
			surfaceId++
		}
	}

	return vertexIds
}

const assignSimilarFaces = (faceIndex, surfaceId, visitedFaces, faceAdjacency, vertexIds, faces) => {
	const queue = [faceIndex]
	// Store a second times, in a set so that we don't have huge list, insert only if not already in queue
	const queueSet = new Set()
	queueSet.add(faceIndex)

	while (queue.length > 0) {
		const currentFaceIndex = queue.shift()
		visitedFaces.add(currentFaceIndex)

		const iv1 = faces[3*currentFaceIndex]
		const iv2 = faces[3*currentFaceIndex + 1]
		const iv3 = faces[3*currentFaceIndex + 2]
		if (vertexIds[iv1] === 0) {
			vertexIds[iv1] = surfaceId
		}
		if (vertexIds[iv2] === 0) {
			vertexIds[iv2] = surfaceId
		}
		if (vertexIds[iv3] === 0) {
			vertexIds[iv3] = surfaceId
		}

		const neighbors = getNeighbors(currentFaceIndex, [iv1, iv2, iv3], faceAdjacency, queueSet)
		for (const neighborIndex of neighbors) {
			if (!visitedFaces.has(neighborIndex)) {
				queue.push(neighborIndex)
				queueSet.add(neighborIndex)
			}
		}
	}
}

const getNeighbors = (faceIndex, verticesIdxFaces, faceAdjacency, queueSet) => {
	const neighbors = new Set()

	for (const vertexIndex of verticesIdxFaces) {
		const adjacentFaces = faceAdjacency.get(vertexIndex)
		for (const adjacentFace of adjacentFaces) {
			if (adjacentFace !== faceIndex && !queueSet.has(adjacentFace)) {
				neighbors.add(adjacentFace)
			}
		}
	}

	return Array.from(neighbors)
}

function computeFaceAdjacency(faces) {
	const adjacency = new Map();

	const num_faces    = (faces.length / 3) | 0

	for (let faceIndex = 0; faceIndex < num_faces; faceIndex++) {
		const vertexIndices = [
			faces[3*faceIndex],
			faces[3*faceIndex + 1],
			faces[3*faceIndex + 2],
		];

		for (const vertexIndex of vertexIndices) {
			if (!adjacency.has(vertexIndex)) {
				adjacency.set(vertexIndex, []);
			}
			adjacency.get(vertexIndex).push(faceIndex);
		}
	}

	return adjacency;
}
```

## Scene creation
```js
import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_matmul_many} from "./icg_math.js"

/*
	Construct the scene!
*/
export function create_scene_content() {

	const actors = [

		{
			translation: [25., 0., 0.7],
			scale: [3., 3., 3.],

			mesh: 'small_destroyer.obj',

			material: {
				color: [0.9, 1., 1.],
				shininess: 5.,
			}
		},

		{
			translation: [25.1, -2.1, 2.4],
			scale: [2.1, 2.1, 2.1],

			mesh: 'small_destroyer.obj',

			material: {
				color: [0.9, 1., 1.],
				shininess: 5.,
			}
		},

		{
			translation: [25.2, 2., 2.5],
			scale: [2.1, 2.1, 2.1],

			mesh: 'small_destroyer.obj',

			material: {
				color: [0.9, 1., 1.],
				shininess: 5.,
			}
		},

		{
			translation: [0., 0., -3.],
			scale: [4., 4., 4.],

			mesh: 'terrain.obj',

			material: {
				color: [0.2, 0.1, 0.],
				shininess: 2.,
			}
		},

		{
			translation: [0., 0., -3.1],
			scale: [8., 8., 4.],

			mesh: 'water.obj',

			material: {
				color: [0., 0.1, 0.5],
				shininess: 7.,
			}
		},

		{
			translation: [0., 0., -2.8],
			scale: [3.95, 3.95, 3.95],

			mesh: 'procedural_low_mountain.obj',

			material: {
				color: [0.27, 0.247, 0.247],
				shininess: 4.,
			}
		},

		{
			translation: [0., 0., -2.3],
			scale: [3.9, 3.9, 3.9],

			mesh: 'procedural_high_mountain.obj',

			material: {
				color: [0.10, 0.24, 0.11],
				shininess: 4.,
			}
		},

		{
			translation: [0., 0., -5.75],
			scale: [3.5, 3.5, 3.5],

			mesh: 'layer1.obj',

			material: {
				color: [0.05, 0.17, 0.07],
				shininess: 2.,
			}
		},

		{
			translation: [0., 0., -4.],
			scale: [3.9, 3.9, 3.9],

			mesh: 'layer2.obj',

			material: {
				color: [0.02, 0.01, 0.04],
				shininess: 4.,
			}
		},

		{
			translation: [0., 0., -2.3],
			scale: [3.9, 3.9, 3.9],

			mesh: 'layer3.obj',

			material: {
				color: [0.25, 0.16, 0.1],
				shininess: 3.,
			}
		},

		{
			translation: [0., 0., -3.58],
			scale: [3.9, 3.9, 3.9],

			mesh: 'layer4.obj',

			material: {
				color: [0.35, 0.26, 0.14],
				shininess: 2.,
			}
		},

		{
			translation: [0., 0., -3.2],
			scale: [3.9, 3.9, 3.9],

			mesh: 'layer5.obj',

			material: {
				color: [0.15, 0.27, 0.17],
				shininess: 4.,
			}
		},

		{
			translation: [300., 150., -210.],
			scale: [0.05, 0.05, 0.05],

			mesh: 'pyramid.obj',

			material: {
				color: [0.15, 0.17, 0.15],
				shininess: 0.,
			}
		},

		{
			translation: [1., 0., -6.4],
			scale: [1.5, 1.5, 1.5],

			mesh: 'column.obj',

			material: {
				color: [0.5, 0.5, 0.5],
				shininess: 1.,
			}
		},

		{
			translation: [79., -79., 39.],
			scale: [0.5, 0.5, 0.5],

			mesh: 'death_star.obj',

			material: {
				color: [0.2, 0.2, 0.2],
				shininess: 3.,
			}
		},

		{
			translation: [40., 25., -19.],
			scale: [0.5, 0.5, 0.5],

			mesh: 'AtAt_s.obj',

			material: {
				color: [0.6, 0.6, 0.6],
				shininess: 3.,
			}
		},

		{
			translation: [1., 0., -6.5],
			scale: [0.1, 0.1, 0.1],

			mesh: 'tie.obj',

			material: {
				color: [0.6, 0.6, 0.6],
				shininess: 3.,
			}
		},


	]

	// In each planet, allocate its transformation matrix
	for(const actor of actors) {
		actor.mat_model_to_world = mat4.create()
	}

	// Lookup of actors by name
	const actors_by_name = {}
	for (const actor of actors) {
		actors_by_name[actor.name] = actor
	}

	// Construct scene info
	return {
		sim_time: 0.,
		actors: actors,
		actors_by_name: actors_by_name,
	}
}
```

## UI and scene navigation
```js
// Menu visibility
	const menu = document.getElementById('menu-background')
	register_keyboard_action('h', () => menu.classList.toggle('hidden'))

	const tabs = new TabsHandler(['toon-tab', 'heat-map-tab'], ['toon-menu', 'heatmap-menu'])

	// Pause
	let is_paused = false;
	register_keyboard_action('p', () => is_paused = !is_paused);

	register_keyboard_action('r', () => { frame_info.sim_time = 0; scene_info.sim_time = 0; });

	let move_light = false;
	register_keyboard_action('l', () => move_light =! move_light)

	register_keyboard_action('w', () => {
		update_cam_transform(frame_info, 1, 0);
	});

	register_keyboard_action('s', () =>{
		update_cam_transform(frame_info, -1, 0);});

	register_keyboard_action('a', () =>{
		update_cam_transform(frame_info, 0, -1);});

	register_keyboard_action('d', () => {
		update_cam_transform(frame_info, 0, 1);});

	register_keyboard_action('q', () => {
		update_cam_transform(frame_info, 0, 0, -1);
	})

	register_keyboard_action('e', () => {
		update_cam_transform(frame_info, 0, 0, 1)
	})

	// Print mat_view
	register_keyboard_action('0', () => {
		console.log('[' + frame_info.mat_view.join(', ') + ']')
		console.log(frame_info)
	})

	const music = document.getElementById('music');
	let is_music_playing = true;
	register_keyboard_action('m', () => {if(is_music_playing) {
		music.pause()
		is_music_playing = false
	} else {
		music.play()
		is_music_playing = true
	}})

	const intensity = {
		ambient_intensity: 0.33,
		diffuse_intensity: 0.33,
		specular_intensity: 0.33,
	}

	const color_number = {
		ambient_color_number: 1,
		diffuse_color_number: 1,
		specular_color_number: 1,
	}

	const min_max_intensity = {
		min_ambient_intensity: 0,
		max_ambient_intensity: 1,
		min_diffuse_intensity: 0,
		max_diffuse_intensity: 1,
		min_specular_intensity: 0,
		max_specular_intensity: 1,
	}

	const color_hue = {
		ambient_hue_color: vec3.fromValues(0, 0, 0),
		diffuse_hue_color: vec3.fromValues(0, 0, 0),
		specular_hue_color: vec3.fromValues(0, 0, 0),
		ambient_hue_intensity: 0,
		diffuse_hue_intensity: 0,
		specular_hue_intensity: 0
	}

	const outline = {
		outline_color: vec3.fromValues(0, 0, 0),
		outline_thickness: 2,
	}

	const general = {
		shadow_part_color: vec3.fromValues(0, 0, 0),
		color_shift: vec3.fromValues(0, 0, 0),
	}

	const heatmap_general = {
		warm_color: vec3.fromValues(1, 0, 0),
		cold_color: vec3.fromValues(0, 1, 1),
		light_factor: 50,
		quantize_heat: false,
		quantize_level: 3,
		distance_heat: 0.5,
	}

	const filter = {
		filter_effect: 0.5,
		filter_negative: false,
		filter_bw: false,
		filter_color_bool: false,
		filter_color: vec3.fromValues(1, 0, 0.5),
		color_lines: false,
		color_lines_opacity: 0.5
	}


	setupInput('ambient_slider', (value) => {
		color_number.ambient_color_number = Number(value)
	})

	setupInput('diffuse_slider', (value) => {
		color_number.diffuse_color_number = Number(value)
	})

	setupInput('specular_slider', (value) => {
		color_number.specular_color_number = Number(value)
	})

	setupInput('min_ambient_intensity', (value) => {
		min_max_intensity.min_ambient_intensity = Number(value)
	})

	setupInput('max_ambient_intensity', (value) => {
		min_max_intensity.max_ambient_intensity = Number(value)
	})

	setupInput('min_diffuse_intensity', (value) => {
		min_max_intensity.min_diffuse_intensity = Number(value)
	})

	setupInput('max_diffuse_intensity', (value) => {
		min_max_intensity.max_diffuse_intensity = Number(value)
	})

	setupInput('min_specular_intensity', (value) => {
		min_max_intensity.min_specular_intensity = Number(value)
	})

	setupInput('max_specular_intensity', (value) => {
		min_max_intensity.max_specular_intensity = Number(value)
	})

	setupInput('ambient_hue_color', (value) => {
		const intColor = hexToInt(value)
		color_hue.ambient_hue_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('diffuse_hue_color', (value) => {
		const intColor = hexToInt(value)
		color_hue.diffuse_hue_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('specular_hue_color', (value) => {
		const intColor = hexToInt(value)
		color_hue.specular_hue_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('ambient_hue_intensity', (value) => {
		color_hue.ambient_hue_intensity = Number(value)
	})

	setupInput('diffuse_hue_intensity', (value) => {
		color_hue.diffuse_hue_intensity = Number(value)
	})

	setupInput('specular_hue_intensity', (value) => {
		color_hue.specular_hue_intensity = Number(value)
	})

	setupInput('ambient_intensity', (value) => {
		intensity.ambient_intensity = Number(value)
	})

	setupInput('diffuse_intensity', (value) => {
		intensity.diffuse_intensity = Number(value)
	})

	setupInput('specular_intensity', (value) => {
		intensity.specular_intensity = Number(value)
	})

	setupInput('shadow_part_color', (value) => {
		const intColor = hexToInt(value)
		general.shadow_part_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('color_shift', (value) => {
		const intColor = hexToInt(value)
		general.color_shift = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('outline_thickness', (value) => {
		outline.outline_thickness = Number(value)
	})

	setupInput('outline_color', (value) => {
		const intColor = hexToInt(value)
		outline.outline_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('warm_color', (value) => {
		const intColor = hexToInt(value)
		heatmap_general.warm_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('cold_color', (value) => {
		const intColor = hexToInt(value)
		heatmap_general.cold_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupInput('light_factor_slider', (value) => {
		heatmap_general.light_factor = Number(value)
	})

	setupCheckBoxInput('quantize_heat', (value) => {
		heatmap_general.quantize_heat = value
	})


	setupInput('quantize_level_slider', (value) => {
		heatmap_general.quantize_level = Number(value)
	})

	setupInput('distance_heat_slider', (value) => {
		heatmap_general.distance_heat = Number(value)
	})

	setupInput('filter_effect_slider', (value) => {
		filter.filter_effect = Number(value)
	})

	setupCheckBoxInput('filter_negative', (value) => {
		filter.filter_negative = value
	})

	setupCheckBoxInput('filter_bw', (value) => {
		filter.filter_bw = value
	})

	setupCheckBoxInput('filter_color_bool', (value) => {
		filter.filter_color_bool = value
	})


	setupInput('filter_color', (value) => {
		const intColor = hexToInt(value)
		filter.filter_color = vec3.fromValues(intColor.r, intColor.g, intColor.b)
	})

	setupCheckBoxInput('color_lines', (value) => {
		filter.color_lines = value
	})

	setupInput('color_lines_opacity_slider', (value) => {
		filter.color_lines_opacity = Number(value)
	})
```


```js
function update_cam_transform(frame_info, move_forward = 0, move_right = 0, move_up = 0) {
		const {cam_angle_z, cam_angle_y, cam_distance_factor, center} = frame_info

		// 1. translate with new center
		const m_translation_1 = mat4.fromTranslation(mat4.create(), center);

		// 2. translate along x-axis by r = cam_distance_base * cam_distance_factor
		const m_dist = mat4.fromTranslation(mat4.create(), [-cam_distance_base * cam_distance_factor, 0, 0])

		// 3. rotation around the y-axis
		const m_y_rotation = mat4.fromYRotation(mat4.create(), -cam_angle_y)

		// 4. rotation around the z-axis
		const m_z_rotation = mat4.fromZRotation(mat4.create(),  -cam_angle_z)

		// 5. Combine the three operation
		const transform_mat_1 = mat4_matmul_many(mat4.create(), m_z_rotation, m_y_rotation, m_dist)

		// 6. Add the translation to translate the to correct center point
		const transform_mat_2 = mat4_matmul_many(mat4.create(), m_translation_1, transform_mat_1)

		// 7. Calculate eye_1 position
		const eye_1 = vec4.transformMat4(vec4.create(), [0, 0, 0, 1], transform_mat_2)

		// 8. Calculate the up_2 vector
		const up_1 = vec4.transformMat4(vec4.create(), [0,0,1,0], transform_mat_2)

		// 9. Normalize the up vector
		const n_up_1 = vec3.normalize(vec3.create(), up_1)

		// 10. Calculate the vector directing from eye to center
		const dir_from_view = vec3.sub(vec3.create(), center, eye_1)

		// 11. Normalize the direction vector
		const n_dir_from_view = vec3.normalize(vec3.create(), dir_from_view)

		// 12. Calculate the right vector
		const right = vec3.cross(vec3.create(), n_dir_from_view, up_1)

		// 13. Normalize the right vector
		const n_right = vec3.normalize(vec3.create(), right)

		// 14. Apply the correct translation to the center point, and store it in frame_info
		const translation = vec3.add(vec3.create(), vec3.scale(vec3.create(), n_right, move_right), vec3.scale(vec3.create(), n_dir_from_view, move_forward))
		const translation_2 = vec3.add(vec3.create(), translation, vec3.scale(vec3.create(), n_up_1, move_up))
		const new_center = vec3.add(vec3.create(), center, translation_2)
		frame_info.center = new_center

		// 15. Use new center point to calculate turn_table matrix
		const m_translation_2 = mat4.fromTranslation(mat4.create(), new_center);

		// 16. Calculate new transform matrix with new center
		const transform_mat_3 = mat4_matmul_many(mat4.create(), m_translation_2, transform_mat_1)

		// 17. Calculate eye_2 position
		const eye_2 = vec4.transformMat4(vec4.create(), [0, 0, 0, 1], transform_mat_3)

		// 18. Calculate the up_2 vector
		const up_2 = vec4.transformMat4(vec4.create(), [0,0,1,0], transform_mat_3)

		// 19. Generate and store the lookAt in the mat_turntable
		frame_info.mat_turntable = mat4.lookAt(mat4.create(), eye_2, new_center, up_2) // [x, y, 0]
	}
```







```js
    export const hexToInt = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)/255;
  const g = parseInt(hex.slice(3, 5), 16)/255;
  const b = parseInt(hex.slice(5, 7), 16)/255;

  return {r, g, b};
}

export class UniqueColorGenerator {
  #uniqueColorsSet
  constructor() {
    this.#uniqueColorsSet = new Set()
    this.#uniqueColorsSet.add('#000000')// prevent from generating black
  }

  #generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  nextColor(idx) {
    if (idx < this.#uniqueColorsSet.size) {
      return hexToInt([...this.#uniqueColorsSet][idx])
    }

    let color = this.#generateRandomColor()

    while (this.#uniqueColorsSet.has(color)) {
      color = this.#generateRandomColor()
    }

    this.#uniqueColorsSet.add(color)

    return hexToInt(color)
  }
}
```

```js
export const setupCheckBoxInput = (inputId, onValueChange) => {
  const input = document.getElementById(inputId)
  input.addEventListener('input', () => {
    onValueChange(input.checked)
  })
}


export class TabsHandler  {
  constructor(tabsId, menus) {
    this.tabsId = tabsId

    document.getElementById(tabsId[0]).style.borderBottomStyle = 'solid'

    this.selectedTabId = tabsId[0]

    tabsId.forEach((id, index) => {
      document.getElementById(id).addEventListener('click', () => {

        this.selectedTabId = id

        this.tabsId.forEach((innerId, innerIndex) => {
          if (innerId !== id) {
            document.getElementById(innerId).style.borderBottomStyle = 'none'
            document.getElementById(menus[innerIndex]).style.display = 'none'

          }
        })
        document.getElementById(id).style.borderBottomStyle = 'solid'
        document.getElementById(menus[index]).style.display = 'block'
      })
    })
  }

  selectedTab() {
    return this.selectedTabId
  }
}
```


