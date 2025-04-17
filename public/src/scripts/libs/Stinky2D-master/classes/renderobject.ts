import { ConvertByteArrayToHex, ConvertHexToByteArray, FixedHexToRgbArray } from "../constants/colors";
import { Easings } from "../functions/easings";
import { Vec2 } from "../functions/math";
import { UniqueID } from "../functions/uid";
import {
	Dimension2D,
	EasingName,
	RenderObjectConstructor,
	RenderObjectDataAttributes,
	RenderObjectEventMap,
	RenderObjectRenderEvent,
	RenderObjectStyleApplyingResults,
	RenderObjectStyles,
	RenderObjectTransformProperty,
	SpritesheetControllerConstructor,
	Vector2
} from "../typings";
import { AudioNode2D } from "./audio-system-2d";
import { Circle } from "./circle";
import { Rectangle } from "./rectangle";
import { Renderer } from "./renderer";
import { Scene } from "./scene";
import { SpritesheetController } from "./spritesheet-controller";

function checkSquareProperties(obj: RenderObject) {

	if (typeof obj.x === "number" && typeof obj.y === "number" &&
		typeof obj.width === "number" && typeof obj.height === "number"
	) return true; 

	return false;
} 

function isMouseInCircle(mouseX: number, mouseY: number, circleX: number, circleY: number, circleRadius: number): boolean {

	const dx = mouseX - circleX,
		dy = mouseY - circleY,
		distance = Math.sqrt(dx * dx + dy * dy);

	return distance <= circleRadius;
}

export const AllExistingRenderObjects: RenderObject[] = [];

export class RenderObject implements RenderObjectConstructor {

	/** Unique generated id for each render object. */
	public id = UniqueID(18).id;

	/** Counts the amount of render objects created in general. */
	public exisitingObjectCount = AllExistingRenderObjects.length + 1;

	/** Timestamp of when the render object has been made. */
	public timestamp = Date.now();

	/** Array index of renderer instance. */
	public arrayIndex: number = 0;

	/** Boolean which determines whether the object is visible or not. */
	public visible: boolean = true;

	/** Forces rendering outside the camera view/ */
	public forceRendering: boolean = false;

	/** Render object attributes. */
	public attributes: { [K in RenderObjectDataAttributes]?: string } = {};

	/** All events stored in this object. */
	public events: { [key: string]: Function } = {};

	/** All events that will be emitted once. */
	public eventsOnce: { [key: string]: Function } = {};

	/** Event states.*/
	public eventStates = { hasEntered: false, hasLeft: false, hasClicked: false, isDown: false, isUp: false };

	/** Render object children applied to this instance. */
	public children: RenderObject[] = [];

	/** Audio node applied to this instance. */
	public audioNodes: AudioNode2D[] = [];

	public styleGroups: { [K: string]: RenderObjectStyles } = {};

	/**
	 * The x-coordinate of the object.
	 * @type {number}
	 * @public
	 */
	declare  public x: number;

	/**
	 * The y-coordinate of the object.
	 * @type {number}
	 * @public
	 */
	declare public y: number;

	/**
	 * The width of the object.
	 * @type {number}
	 * @public
	 */
	declare public width: number;

	/**
	 * The height of the object.
	 * @type {number}
	 * @public
	 */
	declare public height: number;

	/**
	 * The radius of the object.
	 * @type {number}
	 * @public
	 */
	declare public radius: number;

	/**
	 * The segments of the object.
	 * @type {Vector[]}
	 * @public
	 */
	declare public segments: Vector2[];

	/**
	 * The styles of the object.
	 * @type {RenderObjectStyles}
	 * @public
	 */
	declare public styles: RenderObjectStyles;

	/**
   * The transform of the object.
   * @type {number[] | null}
   * @public
   */
	declare public transform: number[] | null;

	/**
	 * The scaling of the object.
	 * @type {Vector2 | null}
	 * @public
	 */
	declare public scaling: Vector2 | null;

	/**
	 * The rotation of the object.
	 * @type {number}
	 * @public
	 */
	declare public rotation: number;

	/**
	 * The velocity in the X direction.
	 * @type {number}
	 * @public
	 */
	declare public velocityX: number;

	/**
	 * The velocity in the Y direction.
	 * @type {number}
	 * @public
	 */
	declare public velocityY: number;

	/**
	 * The acceleration of the object.
	 * @type {number}
	 * @public
	 */
	declare public acceleration: number;

	/**
	 * The mass of the object.
	 * @type {number}
	 * @public
	 */
	declare public mass: number;

	/**
	 * The scene that the object belongs to.
	 * @type {Scene}
	 * @public
	 */
	declare public scene: Scene;

	/**
	 * The renderer used to render the object.
	 * @type {Renderer}
	 * @public
	 */
	declare public renderer: Renderer;

	/**
	 * The initial position of the object.
	 * @type {Vector2}
	 * @public
	 */
	declare public initialPosition: Vector2;

	/**
	 * The initial dimensions of the object.
	 * @type {Dimension2D}
	 * @public
	 */
	declare public initialDimension: Dimension2D;

	declare public spritesheetController?: SpritesheetController | SpritesheetControllerConstructor;

	constructor() {

		this.transform = null;
		this.scaling = null;

		AllExistingRenderObjects.push(this);
	}

	public Draw(ctx: CanvasRenderingContext2D) { return 0; }
	public Update(ctx: CanvasRenderingContext2D, deltaTime: number) { return 0; }
	public OnAdd(renderer: Renderer) { return; }

	private _handleEventProperties(isInObject: boolean, fixedMousePosition: Vector2) {

		if (isInObject) {

			if (!this.eventStates.hasEntered) {

				if (typeof this.events["mouseEnter"] === "function") this.events["mouseEnter"]({
					target: this,
					mousePosition: fixedMousePosition,
					mouse: this.scene.mouse
				});

				this.eventStates.hasLeft = false;
				this.eventStates.hasEntered = true;
			}

			if (this.scene.mouse.buttons.left || this.scene.mouse.buttons.middle || this.scene.mouse.buttons.right) {

				if (!this.eventStates.isDown) {

					if (typeof this.events["mouseDown"] === "function") this.events["mouseDown"]({
						target: this,
						mousePosition: fixedMousePosition,
						mouse: this.scene.mouse
					});

					this.eventStates.isDown = true;
				}

				this.eventStates.isDown = false;

				if (typeof this.events["mouseDown"] === "function") this.scene.mouse.buttons.resetState();
			}

			if (this.scene.mouse.wheelDirection !== null) {

				if (typeof this.events["mouseWheel"] === "function") this.events["mouseWheel"]({
					target: this,
					mousePosition: fixedMousePosition,
					mouse: this.scene.mouse
				});

				this.scene.mouse.wheelDirection = null;
			}

		} else {

			if (this.eventStates.hasClicked) this.eventStates.hasClicked = false;

			if (this.eventStates.hasEntered) {

				if (typeof this.events["mouseOut"] === "function") this.events["mouseOut"]({
					target: this,
					mousePosition: fixedMousePosition,
					mouse: this.scene.mouse
				});

				this.eventStates.hasLeft = true;
				this.eventStates.hasEntered = false;
			}
		}
	}

	private _updateOnMouseOverEvent() {

		const fixedMousePosition: Vector2 = this.scene.GetFixedMousePosition();

		if (typeof this.width === "number" && typeof this.height === "number") {

			const isInObject: boolean = fixedMousePosition.x >= this.x && fixedMousePosition.x <= this.x + this.width && fixedMousePosition.y >= this.y && fixedMousePosition.y <= this.y + this.height;

			this._handleEventProperties(isInObject, fixedMousePosition);
		}

		if (typeof this.radius === "number") 
			this._handleEventProperties(isMouseInCircle(fixedMousePosition.x, fixedMousePosition.y, this.x, this.y, this.radius), fixedMousePosition);

	}

	// =============== Public shit ===============

	public UpdateEvents() {

		if (typeof this.scene === "undefined" && typeof this.renderer === "undefined") return this;
		if (typeof this.renderer.camera === "undefined") return;

		this._updateOnMouseOverEvent();

		if (this.visible) {

			if (typeof this.events["render"] === "function") this.events["render"]({
				target: this,
				timestamp: Date.now()
			} as RenderObjectRenderEvent);
		}
	}


	/**
	 * Centers the render object based on the object's dimensions and position.
	 * @param x x-axis.
	 * @param y y-axis.
	 */
	public Center(x: number, y: number): RenderObject {

		if (!checkSquareProperties(this)) throw new Error("Cannot center render object since properties 'x', 'y', 'width' and 'height' does not exist.");

		this.x = x - (this.width / 2);
		this.y = y - (this.height / 2);

		return this;
	}

	/** Sets the position of this object using a method. */
	public SetPosition(x: number | Vec2, y?: number): RenderObject {

		if (x instanceof Vec2) {

			this.x = x.x;
			this.y = x.y;

			return this;
		}
		
		if (typeof this.x !== "number") throw new Error("Cannot set x-axis of object, as it does not exist or is not a number.");
		if (typeof this.y !== "number") throw new Error("Cannot set y-axis of object, as it does not exist or is not a number.");

		if (typeof x === "undefined" || typeof y === "undefined")
			throw new Error();

		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Returns a new Vec2 class provided with the position of this renderobject.
	 * @returns
	 */
	public GetPosition(): Vec2 {

		return new Vec2(this.x, this.y);
	}

	public SetFixedSize(width: number, height: number, position: Vector2) {

		if (typeof this.x !== "number") throw new Error("Cannot set x-axis of object, as it does not exist or is not a number.");
		if (typeof this.y !== "number") throw new Error("Cannot set y-axis of object, as it does not exist or is not a number.");
		if (typeof this.width !== "number") throw new Error("Cannot set width of object, as it does not exist or is not a number.");
		if (typeof this.height !== "number") throw new Error("Cannot set height of object, as it does not exist or is not a number.");

		this.width = width;
		this.height = height;

		this.x = position.x - (this.width / 2);
		this.y = position.y - (this.height / 2);
	}

	/**
	 * Changes the size using a method
	 * @param width Width of this component.
	 * @param height Height of this component.
	 */
	public ChangeSize(width: number | null, height: number | null): RenderObject {

		if (typeof this.width !== "number" || typeof this.height !== "number") return this;

		this.width = width !== null ? width : this.width;
		this.height = height !== null ? height : this.height;

		return this;
	}

	public SetSize(vector: Vec2) {

		if (typeof this.width !== "number" || typeof this.height !== "number") return this;

		this.width = vector.x;
		this.height = vector.y;
	}

	/**
	 * Animates the x position of this object to another specific x position.
	 * @param endX Position where the animation ends.
	 * @param easing Easing type.
	 * @param duration Duration of the animation.
	 */
	public AnimateCurrentXPosition(to: number, easing: EasingName, duration: number): RenderObject {

		if (typeof this.x !== "number") throw new Error("Cannot animate x-axis of object as it does not exist or is not a number.");

		let time: number = Date.now();
		let tick: number = 0;

		let startX = this.x;

		const updateTick = () => {

			const elapsedTime = Date.now() - time;

			const easingValue: number = Easings[easing](elapsedTime, 0, to - startX, duration);

			this.x = startX + easingValue;

			if (elapsedTime < duration)  window.requestAnimationFrame(updateTick);
		}

		updateTick();

		return this;
	}

	/**
	 * Animates the y position of this object to another specific y position.
	 * @param endY Position where the animation ends.
	 * @param easing Easing type.
	 * @param duration Duration of the animation.
	 */
	public AnimateCurrentYPosition(to: number, easing: EasingName, duration: number): RenderObject {
		if (typeof this.y !== "number") throw new Error("Cannot animate y-axis of object as it does not exist or is not a number.");

		let time: number = Date.now();
		let startY = this.y;

		const updateTick = () => {
			const elapsedTime = Date.now() - time;
			const easingValue: number = Easings[easing](elapsedTime, 0, to - startY, duration);

			this.y = startY + easingValue;

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
	public AnimateCurrentPosition(to: Vector2, easing: EasingName, duration: number): RenderObject {

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
	 * Animates this render component from one position to another 
	 * @param from Starting position
	 * @param to Ending position
	 * @param easing Animation type
	 * @param duration Duration of animation
	 */
	public AnimatePosition(from: Vector2, to: Vector2, easing: EasingName, duration: number): RenderObject {

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
	 * Animates the background color to a desired color
	 * @param to Color
	 * @param easing Animation type
	 * @param duration Duration of the animation
	 */
	public AnimateCurrentBackgroundColor(to: string, easing: EasingName, duration: number): RenderObject {

		if (typeof this.styles === "undefined") throw new Error("Cannot reanimate background color as object 'styles' does not exist in this class instance.");
		if (typeof this.styles.backgroundColor !== "string") throw new Error("Cannot animate background color as it contains an invalid value.");

		const now: number = Date.now();

		const currentColor: number[] | null= FixedHexToRgbArray(this.styles.backgroundColor);
		const endColor: number[] | null = FixedHexToRgbArray(to);

		if (endColor === null || currentColor === null) throw new Error("Cannot animate background color as it contains an invalid value.");

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const r: number = Easings[easing](elapsedTime, 0, endColor[0] - currentColor[0], duration);
			const g: number = Easings[easing](elapsedTime, 0, endColor[1] - currentColor[1], duration);
			const b: number = Easings[easing](elapsedTime, 0, endColor[2] - currentColor[2], duration);

			const byteArray = [currentColor[0] + r, currentColor[1] + g, currentColor[2] + b];
			const convertedHeximalString = ConvertByteArrayToHex(byteArray);

			this.styles.backgroundColor = `#${convertedHeximalString}`;


			if (elapsedTime < duration) {
				window.requestAnimationFrame(updateTick);
			} else {
				this.styles.backgroundColor = to;
			}
		}

		updateTick();

		return this;
	}

	/**
	 * Animates the border color to a desired color
	 * @param to Color
	 * @param easing Animation type
	 * @param duration Duration of the animation
	 */
	public AnimateCurrentBorderColor(to: string, easing: EasingName, duration: number): RenderObject {

		if (typeof this.styles === "undefined") throw new Error("Cannot reanimate border color as object 'styles' does not exist in this class instance.");
		if (typeof this.styles.borderColor !== "string") throw new Error("Cannot border background color as it contains an invalid value.");

		const now: number = Date.now();

		const currentColor: number[] | null = FixedHexToRgbArray(this.styles.borderColor);
		const endColor: number[] | null = FixedHexToRgbArray(to);

		if (endColor === null || currentColor === null) throw new Error("Cannot border background color as it contains an invalid value.");

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const r: number = Easings[easing](elapsedTime, 0, endColor[0] - currentColor[0], duration);
			const g: number = Easings[easing](elapsedTime, 0, endColor[1] - currentColor[1], duration);
			const b: number = Easings[easing](elapsedTime, 0, endColor[2] - currentColor[2], duration);

			const byteArray = [currentColor[0] + r, currentColor[1] + g, currentColor[2] + b];
			const convertedHeximalString = ConvertByteArrayToHex(byteArray);

			this.styles.borderColor = `#${convertedHeximalString}`;


			if (elapsedTime < duration) {
				window.requestAnimationFrame(updateTick);
			} else {
				this.styles.borderColor = to;
			}
		}

		updateTick();

		return this;
	}

	/**
	 * Animates the border color to a desired color
	 * @param to Color
	 * @param easing Animation type
	 * @param duration Duration of the animation
	 */
	public AnimateCurrentShadowColor(to: string, easing: EasingName, duration: number): RenderObject {

		if (typeof this.styles === "undefined") throw new Error("Cannot reanimate shadow color as object 'styles' does not exist in this class instance.");
		if (typeof this.styles.shadowColor !== "string") throw new Error("Cannot shadow background color as it contains an invalid value.");

		const now: number = Date.now();

		const currentColor: number[] | null = FixedHexToRgbArray(this.styles.shadowColor);
		const endColor: number[] | null = FixedHexToRgbArray(to);

		if (endColor === null || currentColor === null) throw new Error("Cannot shadow background color as it contains an invalid value.");

		const updateTick = () => {
			const elapsedTime: number = Date.now() - now;

			const r: number = Easings[easing](elapsedTime, 0, endColor[0] - currentColor[0], duration);
			const g: number = Easings[easing](elapsedTime, 0, endColor[1] - currentColor[1], duration);
			const b: number = Easings[easing](elapsedTime, 0, endColor[2] - currentColor[2], duration);

			const byteArray = [currentColor[0] + r, currentColor[1] + g, currentColor[2] + b];
			const convertedHeximalString = ConvertByteArrayToHex(byteArray);

			this.styles.shadowColor = `#${convertedHeximalString}`;


			if (elapsedTime < duration) {
				window.requestAnimationFrame(updateTick);
			} else {
				this.styles.shadowColor = to;
			}
		}

		updateTick();

		return this;
	}

	/**
	 * Animates the current rotation value.
	 * @param to Rotation where the animation will end.
	 * @param easing Name of the animation.
	 * @param duration Duration of the animation.
	 */
	public AnimateCurrentRotation(to: number, easing: EasingName, duration: number): RenderObject {

		if (typeof this.rotation !== "number") throw new Error("Cannot animate rotation of object as it does not exist or is not a number.");

		const now: number = Date.now();
		const startRotation = this.rotation;

		const updateTick = () => {

			const elapsedTime = Date.now() - now;

			const easingValue: number = Easings[easing](elapsedTime, 0, to - startRotation, duration);

			this.rotation = startRotation + easingValue;

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick);
		}

		updateTick();

		return this;
	}

	/**
	 * Appends an event listener which will be evoked when any of these event gets triggered. 
	 * 
	 * When an event listener already exists, an error will be returned.
	 * @param event
	 * @param cb
	 */
	public AddEventListener<K extends keyof RenderObjectEventMap>(event: K, cb: RenderObjectEventMap[K]): RenderObject {

		if (typeof event !== "string") throw new Error("Cannot add event since event argument is not a string type.");
		if (typeof cb !== "function") throw new Error("Cannot add event since callback argument is not a function type."); 

		this.events[event] = cb;

		if (event === "mouseUp" || event === "mouseClick") {

			throw new Error(`Failed to set ${event} event listener on object id ${this.id}.`);
		}

		return this;
	}

	/**
	 * Sets a data attribute to this instance, allowing every 
	 * instance to be unique.
	 * 
	 * @param attributeName Name of attribute.
	 * @param value Value of attribute, which has to be a string.
	 */
	public SetDataAttribute(attributeName: RenderObjectDataAttributes, value: string): RenderObject {

		this.attributes[attributeName] = value;

		return this;
	}

	/**
	 * Returns a set attribute with its value. The value can be either 
	 * a string or null if no attribute is set.
	 * 
	 * @param attributeName Name of attribute.
	 * */
	public GetDataAttribute(attributeName: RenderObjectDataAttributes): string | null {

		const foundAttribute = this.attributes[attributeName];

		return typeof foundAttribute === "undefined" ? null : foundAttribute;
	}

	/**
	 * Sets a style property on this render object instance. 
	 * 
	 * @param style Key of the RenderObjectStyles interface.
	 * @param value Value of the style.
	*/
	public SetStyle(style: keyof RenderObjectStyles, value: any): any {

		return this.styles[style] = value;
	}

	// =============== Static methods ===============

	/**
	 * Animates just a number from a start value, to an ending value.
	 * @param from The value where you want to start animating.
	 * @param to The value where you want the animation to end.
	 * @param easing Animation type.
	 * @param duration Duration of the animation.
	 * @param callback A function that will be called while animating, passing the animated value as argument.
	*/
	public static AnimateNumber(from: number, to: number, easing: EasingName, duration: number, callback: (value: number) => void) {

		const now: number = Date.now();
		
		const updateTick = () => {

			const elapsedTime = Date.now() - now;
			const easingValue: number = Easings[easing](elapsedTime, 0, to - from, duration);

			callback(from + easingValue);

			if (elapsedTime < duration) window.requestAnimationFrame(updateTick);
		}

		updateTick();

	}

	/**
	 * Set the scaling on this render object using a
	 * Vector2 represented number object.
	 **/
	public SetScaling(scale: Vector2): RenderObject {

		this.scaling = scale;

		return this;
	}

	/**
	 * Set the scale x property on this render object.
	 * Or return the current set x scaling value of this object 
	 * as a number.
	 * */
	public ScaleX(number?: number): number | null {

		if (typeof number === "number") {

			if (this.scaling === null) this.scaling = {
				x: 1,
				y: 1
			}

			this.scaling.x = number;

			return this.scaling.x;
		}

		return this.scaling === null ? null : this.scaling.x;
	}

	/**
	 * Set the scale y property on this render object.
	 * Or return the current set y scaling value of this object 
	 * as a number.
	 * */
	public ScaleY(number?: number): number | null {

		if (typeof number === "number") {

			if (this.scaling === null) this.scaling = {
				x: 1,
				y: 1
			}

			this.scaling.y = number;

			return this.scaling.y;
		}

		return this.scaling === null ? null : this.scaling.y;
	}

	/** Disables scaling which may imrove the rendering performance. */
	public DisableScaling(): RenderObject {

		this.scaling = null;

		return this;
	}

	/** 
	 *  Enables scaling by setting the values for both x and y to 1 by default.
	 *  
	 *  This method is optional to enable scaling. Scaling can also be enabled using
	 *  the following methods:
	 *  
	 *  SetScaling(scalingObject);
	 *  ScaleX(scale);
	 *  ScaleY(scale);
	 */
	public EnableScaling(): RenderObject {
		this.scaling = { x: 1, y: 1 };

		return this;
	}

	public SetTransform(
		horizontalScaling: number,
		verticalSkewing: number,
		horizontalSkewing: number,
		verticalScaling: number,
		horizontalTranslation: number,
		verticalTranslation: number
	): RenderObject {

		this.transform = [
			horizontalScaling,
			verticalSkewing,
			horizontalSkewing,
			verticalScaling,
			horizontalTranslation,
			verticalTranslation
		];

		return this;
	}

	/**
	 * Gets a specific transform property and return its value.
	 * 
	 * Will return null if the transform property does not contain valid values.
	 * */
	public GetTransformProperty(transformProperty: RenderObjectTransformProperty): number | null {

		if (this.transform === null) return null;

		switch (transformProperty) {
			case "hozirontalScaling": return this.transform[0];
			case "verticalSkewing": return this.transform[1];
			case "horizontalSkewing": return this.transform[2];
			case "verticalScaling": return this.transform[3];
			case "horizontalTranslation": return this.transform[4];
			case "verticalTranslation": return this.transform[5];
		}

		return null;
	}

	public SetTransformProperty(transformProperty: RenderObjectTransformProperty, value: number) {

		if (this.transform === null) return null;

		switch (transformProperty) {
			case "hozirontalScaling": this.transform[0] = value;
			case "verticalSkewing": this.transform[1] = value;
			case "horizontalSkewing": this.transform[2] = value;
			case "verticalScaling": this.transform[3] = value;
			case "horizontalTranslation": this.transform[4] = value;
			case "verticalTranslation": this.transform[5] = value;
		}

		return this.transform;
	}

	/**
	 * Creates an style group to change the rendering styles of this object.
	 * @param name Name of the styles
	 * @param styles Styles
	 */
	public CreateStyleGroup(name: string, styles: RenderObjectStyles) {

		if (typeof this.styleGroups[name] !== "undefined")
			throw new Error(`Cannot overwrite style group since group named '${name}' already exist.`);

		this.styleGroups[name] = styles;

		return this;
	}

	public DeleteStyleGroup(name: string): RenderObject {

		if (typeof this.styleGroups[name] === "undefined")
			throw new Error(`Cannot delete style group '${name}' since it does not exist.`);

		delete this.styleGroups[name];

		return this;
	}

	/**
	 * Uses a style group. Will throw an error if group does not exist.
	 * @param name Name of the style group
	 * @returns
	 */
	public UseStyleGroup(name: string): RenderObject {

		if (typeof this.styleGroups[name] === "undefined")
			throw new Error(`Cannot use style group '${name}' since it does not exist.`);

		for (let key in this.styleGroups[name]) 
			// @ts-ignore
			this.SetStyle(key, this.styleGroups[name][key]);
		

		return this;
	}

	/** Fuckinf fucky fuck fuck fuck */
	public static ApplyRenderStyles(ctx: CanvasRenderingContext2D, styles: RenderObjectStyles): RenderObjectStyleApplyingResults {

		const startedAt: number = Date.now();

		if (typeof styles.direction === "string") ctx.direction = styles.direction;
		if (typeof styles.backgroundColor === "string") ctx.fillStyle = styles.backgroundColor;
		if (typeof styles.textColor === "string") ctx.fillStyle = styles.textColor;
		if (typeof styles.filter === "string") ctx.filter = styles.filter;
		if (typeof styles.font === "string") ctx.font = styles.font;
		if (typeof styles.opacity === "number") ctx.globalAlpha = styles.opacity;
		if (typeof styles.globalCompositeOperation === "string") ctx.globalCompositeOperation = styles.globalCompositeOperation;
		if (typeof styles.imageSmoothingEnabled === "boolean") ctx.imageSmoothingEnabled = styles.imageSmoothingEnabled;
		if (typeof styles.imageSmoothingQuality === "string") ctx.imageSmoothingQuality = styles.imageSmoothingQuality;
		if (typeof styles.lineCap === "string") ctx.lineCap = styles.lineCap;
		if (typeof styles.lineDashOffset === "number") ctx.lineDashOffset = styles.lineDashOffset;
		if (typeof styles.lineJoin === "string") ctx.lineJoin = styles.lineJoin;
		if (typeof styles.miterLimit === "number") ctx.miterLimit = styles.miterLimit;
		if (typeof styles.borderWidth === "number") ctx.lineWidth = styles.borderWidth;
		if (typeof styles.strokeWidth === "number") ctx.lineWidth = styles.strokeWidth;
		if (typeof styles.lineWidth === "number") ctx.lineWidth = styles.lineWidth;
		if (typeof styles.borderColor === "string") ctx.strokeStyle = styles.borderColor;
		if (typeof styles.strokeColor === "string") ctx.strokeStyle = styles.strokeColor;
		if (typeof styles.textStrokeColor === "string") ctx.strokeStyle = styles.textStrokeColor;
		if (typeof styles.shadowBlur === "number") ctx.shadowBlur = styles.shadowBlur;
		if (typeof styles.shadowColor === "string") ctx.shadowColor = styles.shadowColor;
		if (typeof styles.shadowOffsetX === "number") ctx.shadowOffsetX = styles.shadowOffsetX;
		if (typeof styles.shadowOffsetY === "number") ctx.shadowOffsetY = styles.shadowOffsetY;
		if (typeof styles.textAlign === "string") ctx.textAlign = styles.textAlign;
		if (typeof styles.textBaseline === "string") ctx.textBaseline = styles.textBaseline;

		const endedAt: number = Date.now();

		return {
			startedAt: startedAt,
			endedAt: endedAt,
			duration: endedAt - startedAt
		}
	}

}