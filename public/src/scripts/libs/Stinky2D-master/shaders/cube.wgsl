struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>
}

@binding(0) @group(0) var<uniform> transformUniform: TransformData;

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>
};

// @location(1) vertexColor: vec3<f32>
@vertex fn vertexMain(@location(0) vertexPosition: vec3<f32>) -> Fragment {
   
    var output : Fragment;

    output.Position = transformUniform.projection * transformUniform.view * transformUniform.model * vec4<f32>(vertexPosition, 1.0);
    output.Color = vec4<f32>(1, 1, 1, 1.0);
 
    return output;
}

@fragment fn fragmentMain(@location(0) triangleColor: vec4<f32>) -> @location(0) vec4<f32> {

    return triangleColor;
}