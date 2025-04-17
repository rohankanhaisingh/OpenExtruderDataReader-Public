import { Easings } from "../functions/easings";
import { AnimateInteger, Vec2 } from "../functions/math";
import { CameraConstructor, CameraFocusAnimation, EasingName, RendererConstructor, SceneConstructor, Vector2 } from "../typings";
import { Rectangle } from "./rectangle";
import { Renderer } from "./renderer";
import { RenderObject } from "./renderobject";
import { Scene } from "./scene";

export class Camera implements CameraConstructor {

	public x = 0;
	public y = 0;
	public scaleX = 1;
	public scaleY = 1;
	public width = innerWidth;
	public height = innerHeight;
	public offScreenRendering = false;

	public lastOffset = {
		x: 0,
		y: 0
	}

	declare public renderer: Renderer | RendererConstructor;
	declare public scene: Scene | SceneConstructor;
	declare public ctx: CanvasRenderingContext2D;

	/**
	 * This camera class allows you to render graphical components located at off-screen coordinates.
	 * @param renderer Renderer class used to project the view
	 * @param scene Scene classes used to determine the dimensions of the screen
	 */
	constructor(renderer: Renderer | RendererConstructor, scene: Scene | SceneConstructor) {

		this.renderer = renderer;
		this.scene = scene;
		this.ctx = renderer.context;

		renderer.camera = this;
		scene.camera = this;
	}

	/**
	 * Sets the camera offset, no idea why you need this but it's there :).
	 * @param x
	 * @param y
	 */
	public SetOffset(x: number | null, y: number | null): Camera {

		if (typeof x === "number") {

			this.lastOffset.x = this.x;

			this.x = -x;
		}

		if (typeof y === "number") {

			this.lastOffset.y = this.y;

			this.x = -y;
		}

		return this;
	}

	/**
	 * The `Focus` function takes a renderObject as input and adjusts the camera or context position to center it on the object within a given scene. 
	 * It calculates the new x and y coordinates based on the scene dimensions and the renderObject's center. 
	 * This ensures that the object remains centered in the scene, allowing the user or viewer to focus on it while other elements may be moving.
	 * 
	 * @param renderObject The object the camera should focus on.
	 * @param scaling Sets the scaling level when focusing. This can be either a 'Vec2' class or a number. Null can be used to skip this paramater.
	 * @param offset Sets the offset level when focusing. This can be either a 'Vec2' class or a number. Null can be used to skip this paramater.
	 * @param animation Uses an animation to focus on the given render object.
	 */
	public Focus(renderObject: RenderObject, scaling: number | Vec2 | null, offset: number | Vec2 | null, animation?: CameraFocusAnimation): Camera {

		const sceneWidth: number = this.scene.width,
			sceneHeight: number = this.scene.height;

		if (scaling !== null) {
			if (animation) {

				AnimateInteger(this.scaleX, scaling instanceof Vec2 ? scaling.x : scaling, animation.animationName, animation.animationDuration, scale => this.scaleX = scale);
				AnimateInteger(this.scaleY, scaling instanceof Vec2 ? scaling.y : scaling, animation.animationName, animation.animationDuration, scale => this.scaleY = scale);
			} else {

				this.scaleX = scaling instanceof Vec2 ? scaling.x : scaling;
				this.scaleY = scaling instanceof Vec2 ? scaling.y : scaling;
			}
		}

		// Calculate the offset based on the scaling level.
		let offsetX = 0;
		let offsetY = 0;

		if (offset !== null) {

			offsetX = offset instanceof Vec2 ? offset.x : offset;
			offsetY = offset instanceof Vec2 ? offset.y : offset;
		}

		const scaleX: number = scaling !== null ? (scaling instanceof Vec2 ? scaling.x : scaling) : this.scaleX;
		const scaleY: number = scaling !== null ? (scaling instanceof Vec2 ? scaling.y : scaling) : this.scaleY;

		// Calculate the scaled renderObject center position.
		const scaledCenterX = renderObject instanceof Rectangle ? (renderObject.x + renderObject.width / 2) * scaleX : (renderObject.x + renderObject.radius) * scaleX;
		const scaledCenterY = renderObject instanceof Rectangle ? (renderObject.y + renderObject.height / 2) * scaleY : (renderObject.y + renderObject.radius) * scaleY;

		// Calculate the position to center the camera on the scaled renderObject.
		const calculatedHorizontalPosition = -(scaledCenterX - sceneWidth / 2);
		const calculatedVerticalPosition = -(scaledCenterY - sceneHeight / 2);

		if (animation) {

			AnimateInteger(this.x, calculatedHorizontalPosition + offsetX, animation.animationName, animation.animationDuration, pos => this.x = pos);
			AnimateInteger(this.y, calculatedVerticalPosition + offsetY, animation.animationName, animation.animationDuration, pos => this.y = pos);
		} else {

			this.x = calculatedHorizontalPosition + offsetX;
			this.y = calculatedVerticalPosition + offsetY;
		}

		return this;
	}

	public Scale(scaling: number | Vec2): Camera {

		if (scaling instanceof Vec2) {

			this.scaleX = scaling.x;
			this.scaleY = scaling.y;

			return this;
		}

		this.scaleX = scaling;
		this.scaleY = scaling;

		return this;
	}

	/**
	 * Animates the camera position from one position to another 
	 * @param from Starting position
	 * @param to Ending position
	 * @param easing Animation type
	 * @param duration Duration of animation
	 */
	public AnimatePosition(from: Vector2, to: Vector2, easing: EasingName, duration: number): Camera {

		if (typeof this.y !== "number") throw new Error("Cannot animate y-axis of object as it does not exist or is not a number.");
		if (typeof this.x !== "number") throw new Error("Cannot animate x-axis of object as it does not exist or is not a number.");

		const now: number = Date.now();

		const startX = from.x;
		const startY = from.y;

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const animatedX: number = Easings[easing](elapsedTime, 0, to.x - startX, duration);
			const animatedY: number = Easings[easing](elapsedTime, 0, to.y - startY, duration);

			this.x = startX + animatedX;
			this.y = startY + animatedY;

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick);
		}

		updateTick();

		return this;
	}

	/**
	 * Animates the position of this object to another specific y position.
	 * @param to Positions where the animation ends.
	 * @param easing Easing type.
	 * @param duration Duration of the animation.
	 */
	public AnimateCurrentPosition(to: Vector2, easing: EasingName, duration: number): Camera {

		if (typeof this.y !== "number") throw new Error("Cannot animate y-axis of object as it does not exist or is not a number.");
		if (typeof this.x !== "number") throw new Error("Cannot animate x-axis of object as it does not exist or is not a number.");

		const now: number = Date.now();

		const startX = this.x;
		const startY = this.y;

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const animatedX: number = Easings[easing](elapsedTime, 0, to.x - startX, duration);
			const animatedY: number = Easings[easing](elapsedTime, 0, to.y - startY, duration);

			this.x = startX + animatedX;
			this.y = startY + animatedY;

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick);
		}

		updateTick();
		return this;
	}

	/**
	 * Animates the scaling of this object to another specific y position.
	 * @param to Scaleing where the animation ends.
	 * @param easing Easing type.
	 * @param duration Duration of the animation.
	 */
	public AnimateCurrentScaling(to: Vector2, easing: EasingName, duration: number): Camera {

		if (typeof this.y !== "number") throw new Error("Cannot animate y-axis of object as it does not exist or is not a number.");
		if (typeof this.x !== "number") throw new Error("Cannot animate x-axis of object as it does not exist or is not a number.");

		const now: number = Date.now();

		const startX = this.scaleX;
		const startY = this.scaleY;

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const animatedX: number = Easings[easing](elapsedTime, 0, to.x - startX, duration);
			const animatedY: number = Easings[easing](elapsedTime, 0, to.y - startY, duration);

			this.scaleX = startX + animatedX;
			this.scaleY = startY + animatedY;

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick);
		}

		updateTick();
		return this;
	}

}