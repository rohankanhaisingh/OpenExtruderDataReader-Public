import { Easings } from "../functions/easings";
import { CircleConstructor, EasingName, RenderObjectStyles, RenderObjectDragConfiguration, DragOffsetType, DragMouseButton } from "../typings";
import { RenderObject } from "./renderobject";
import { Scene } from "./scene";

function isMouseInCircle(mouseX: number, mouseY: number, circleX: number, circleY: number, circleRadius: number ): boolean {

	const dx = mouseX - circleX,
		dy = mouseY - circleY,
		distance = Math.sqrt(dx * dx + dy * dy);

	return distance <= circleRadius;
}

export class Circle extends RenderObject implements CircleConstructor {

	public x = 0;
	public y = 0;
	public rotation = 0;

	public dragConfig: RenderObjectDragConfiguration = {
		isEnabled: false,
		offsetType: null,
		scene: null,
		button: "left"
	}

	declare public radius: number;
	declare public startRadian: number;
	declare public endRadian: number;
	declare public counterClockwise: boolean;

	private _mouseOffset = {
		active: false,
		x: 0,
		y: 0
	}

	constructor(x: number, y: number, radius: number, startRadian: number, endRadian: number, counterClockwise: boolean, styles?: RenderObjectStyles ) {
		super();

		this.x = x;
		this.y = y;
		this.radius = radius;
		this.startRadian = startRadian;
		this.endRadian = endRadian;
		this.counterClockwise = counterClockwise;

		this.styles = { ...styles };
	}
	public override Draw(ctx: CanvasRenderingContext2D): number {

		if (this.radius < 0) return 0;

		ctx.save();
		ctx.beginPath();

		RenderObject.ApplyRenderStyles(ctx, this.styles);

		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation * Math.PI / 180);

		ctx.arc(0, 0, this.radius, this.startRadian * Math.PI / 180, this.endRadian * Math.PI / 180, this.counterClockwise);

		if (typeof this.styles.backgroundColor === "string") ctx.fill();
		if (typeof this.styles.borderColor === "string") ctx.stroke();

		ctx.closePath();
		ctx.restore();
		return 0;
	}

	public override Update(ctx: CanvasRenderingContext2D, deltaTime: number): number {

		if (this.dragConfig.isEnabled) {

			const scene = this.dragConfig.scene as Scene;
			const isPressed = scene.mouse.buttons[this.dragConfig.button];

			const isInCircle: boolean = isMouseInCircle(scene.mouse.x, scene.mouse.y, this.x, this.y, this.radius);

			if (isPressed && isInCircle) {

				if (!this._mouseOffset.active) {

					const offsetX = this.x - scene.mouse.x;
					const offsetY = this.y - scene.mouse.y;

					this._mouseOffset.x = offsetX;
					this._mouseOffset.y = offsetY;

					this._mouseOffset.active = true;
					scene.mouse.isDragging = true;
				}

				if (this.dragConfig.offsetType === "center") {

					this.x = scene.mouse.x;
					this.y = scene.mouse.y;
				}

				if (this.dragConfig.offsetType === "offset") {

					this.x = scene.mouse.x + this._mouseOffset.x;
					this.y = scene.mouse.y + this._mouseOffset.y;
				}
			} else {

				this._mouseOffset.active = false;
			}

		}

		this.UpdateEvents();

		return 0;
	}

	public AnimateCurrentStartAngle(to: number, easing: EasingName, duration: number) {

		if (typeof this.rotation !== "number") throw new Error("Cannot animate rotation of object as it does not exist or is not a number.");

		const now: number = Date.now();
		const startRadian = this.startRadian;

		const updateTick = () => {

			const elapsedTime = Date.now() - now;
			
			const easingValue: number = Easings[easing](elapsedTime, 0, to - startRadian, duration);


			this.startRadian = startRadian + easingValue;

			if (elapsedTime < duration) {
				window.requestAnimationFrame(updateTick);
			} else {
				this.endRadian = to;
			}
		}

		updateTick();

		return this;
	}

	public AnimateCurrentEndAngle(to: number, easing: EasingName, duration: number) {

		if (typeof this.rotation !== "number") throw new Error("Cannot animate rotation of object as it does not exist or is not a number.");

		const now: number = Date.now();
		const endRadian = this.endRadian;

		const updateTick = () => {

			const elapsedTime = Date.now() - now;

			const easingValue: number = Easings[easing](elapsedTime, 0, to - endRadian, duration);


			this.endRadian = endRadian + easingValue;

			if (elapsedTime < duration) {
				window.requestAnimationFrame(updateTick);
			} else {
				this.endRadian = to;
			}
		}

		updateTick();

		return this;
	}

	public AnimateCurrentRadius(to: number, easing: EasingName, duration: number) {

		if (typeof this.radius !== "number")
			throw new Error("Cannot animate radius of object as it does not exist or is not a number.");

		const now: number = Date.now(),
			currentRadius: number = this.radius;

		const updateTick = (): void => {

			const elapsedTime: number = Date.now() - now,
				easedValue: number = Easings[easing](elapsedTime, 0, to - currentRadius, duration);

			this.radius = currentRadius + easedValue;

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick)
			else this.radius = to;
		}

		updateTick();
	}

	/**
	 * Configures the 'drag' function.
	 * @param scene The scene used to access the mouse object.
	 * @param offsetType Offset type
	 */
	public ConfigureDragging(scene: Scene, offsetType: DragOffsetType, button: DragMouseButton): boolean | Circle {

		(scene as Scene).mouse.isDragging = false;

		this.dragConfig.scene = scene;
		this.dragConfig.offsetType = offsetType;
		this.dragConfig.button = button;

		return this;
	}

	/**
	 * Enables dragging on this render component based on the set dragging configuration.
	 * 
	 * Will return an error if this component has not been configurated.
	 */
	public EnableDragging(): boolean {

		if (this.dragConfig.offsetType === null || this.dragConfig.scene === null)
			throw new Error("Cannot enable the 'drag' function because the render component is not properly configured. If you did configure the component, make sure the 'EnableDragging' function is called after you have configured the component.");

		return this.dragConfig.isEnabled = true;
	}

	/** Disables dragging on this render component. */
	public DisableDragging(): boolean {

		return this.dragConfig.isEnabled = false;
	}
}