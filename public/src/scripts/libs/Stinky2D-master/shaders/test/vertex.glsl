attribute vec3 position;
attribute vec3 color;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 vColor;

void main() {

	gl_Position = projection * view * model * vec4(position, 1.0);

    vColor = color;

	return;
}