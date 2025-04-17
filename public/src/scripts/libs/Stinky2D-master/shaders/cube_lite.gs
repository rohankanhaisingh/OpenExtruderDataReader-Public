namespace Shader {

	interface TransformData {
		model: Matrix4x4<float>;
		view: Matrix4x4<float>;
		projection: Matrix4x4<float>;
	}

	interface Fragment {
		Position<@builtin(postition)>: Vector4<float>;
		Color<@location(0)>: Vector4<float>;
	}

	@binding(0) @group(0) uniform transformUniform: TransformData;

	stage: vertex {
		
		function main(): Fragment {
			
			let output: Fragment;

			output.Position = transformUniform.projection * transformUniform.view * transformUniform.model * Vector4<float>(vertexPosition, 1.0);
			output.Color = Vector4<float>(vertexColor, 1);

			return output as Fragment;
		}
	}

	stage: fragment {
	
		function main(Color: Vector4<float> in @location(0)): Color in @location(0) as Vector4<float> {
			
			return Color;
		}
	}
}