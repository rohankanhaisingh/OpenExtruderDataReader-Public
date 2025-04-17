import { RandomIntBetween, Vec2 } from "../functions/math";
import { UniqueID } from "../functions/uid";
import { CameraConstructor, MouseDownObject, MouseEnterObject, MouseMoveObject, MouseOutObject, MouseUpObject, MouseWheelObject, RendererConstructor, SceneAttributes, SceneConstructor, SceneEventsMap, SceneImageFormat, SceneMouseObject, Vector2 } from "../typings";
import { Camera } from "./camera";
import { Renderer } from "./renderer";

function createMouseObject(): SceneMouseObject {
	return {
		x: 0,
		y: 0,
		velocityY: 0,
		buttons: {
			left: false,
			middle: false,
			right: false,
			resetState: function () {
				this.left = false;
				this.middle = false;
				this.right = false;
			}
		},
		checkObjectEntry: function (x: number, y: number, range: number) {

			if (x >= this.x - range && x <= this.x + range && y >= this.y - range && y <= this.y + range) {

				return true;
			}

			return false;
		},
		lastTimestamp: 0,
		isInWindow: false,
		velocityX: 0,
		wheelDirection: null
	}
}

export class Scene implements SceneConstructor {

	public width;
	public height;
	public domElement;
	public canvasElement;

	public id: string = UniqueID(18).id;

	public events: {[key: string]: Function} = {};

	declare public attributes: SceneAttributes[];
	declare public mouse: SceneMouseObject;

	declare public camera: Camera | CameraConstructor;
	declare public renderer: Renderer | RendererConstructor;

	/**
	 * Creates a scene in which graphical elements are rendered. This is a required component within the program.
	 * @param width
	 * @param height
	 * @param domElement
	 * @param attributes
	 */
	constructor(width: number, height: number, domElement: HTMLElement, attributes?: SceneAttributes[]) {

		this.width = width;
		this.height = height;

		this.domElement = domElement;

		this.mouse = createMouseObject();
		this.attributes = [];
		

		if(attributes) this.attributes = attributes;


		const canvas = document.createElement("canvas");
		canvas.className = "scene stinky2d-scene bruh";
		canvas.width = width;
		canvas.height = height;

		canvas.setAttribute("crossOrigin", "anonymous");
		canvas.setAttribute("scene-id", this.id);
		canvas.setAttribute("scene-type", "2d");
		canvas.setAttribute("enable-mouse-tracking", "true");
		canvas.setAttribute("enable-keyboard-tracking", "true");

		domElement.appendChild(canvas);


		this.canvasElement = canvas;

		this._handleMouseEvents();
		window.addEventListener("resize", () => { this._handleResizeEvents() });
	}

	private _handleMouseEvents(): void {

		this.canvasElement.addEventListener("mousemove", event => {

			const now = performance.now(),
				deltaTime = now - this.mouse.lastTimestamp,
				distanceX = Math.abs(event.clientX - this.mouse.x),
				speedX = Math.round(distanceX / deltaTime * 1000),
				distanceY = Math.abs(event.clientY - this.mouse.y),
				speedY = Math.round(distanceY / deltaTime * 1000);

			this.mouse.velocityX = speedX;
			this.mouse.velocityY = speedY;

			this.mouse.x = event.clientX;
			this.mouse.y = event.clientY;

			this.mouse.lastTimestamp = now;

			if (typeof this.events["mouseMove"] === "function") this.events["mouseMove"](<MouseMoveObject>{
				timestamp: Date.now(),
				lastTimestamp: this.mouse.lastTimestamp,
				scene: this,
				x: this.mouse.x,
				y: this.mouse.y,
				velocityX: this.mouse.velocityX,
				velocityY: this.mouse.velocityY
			});
		});
		this.canvasElement.addEventListener("mousedown", event => {

			switch (event.button) {

				case 0: this.mouse.buttons.left = true; break;
				case 1: this.mouse.buttons.middle = true; break;
				case 2: this.mouse.buttons.right = true; break;
			}

			if (typeof this.events["mouseDown"] === "function") this.events["mouseDown"](<MouseDownObject>{
				buttons: this.mouse.buttons,
				timestamp: Date.now(),
				scene: this
			});
		});
		this.canvasElement.addEventListener("mouseup", event => {

			switch (event.button) {

				case 0: this.mouse.buttons.left = false; break;
				case 1: this.mouse.buttons.middle = false; break;
				case 2: this.mouse.buttons.right = false; break;
			}

			if (typeof this.events["mouseUp"] === "function") this.events["mouseUp"](<MouseUpObject>{
				buttons: this.mouse.buttons,
				timestamp: Date.now(),
				scene: this
			});
		});
		this.canvasElement.addEventListener("mouseout", event => {

			if (typeof this.events["mouseOut"] === "function") this.events["mouseOut"](<MouseOutObject>{
				timestamp: Date.now(),
				lastPosition: {
					x: this.mouse.x,
					y: this.mouse.y,
				},
				isInWindow: false,
				scene: this
			});

			this.mouse.x = 0;
			this.mouse.y = 0;

			this.mouse.isInWindow = false;
		});
		this.canvasElement.addEventListener("mouseenter", event => {

			if (typeof this.events["mouseEnter"] === "function") this.events["mouseEnter"](<MouseEnterObject>{
				timestamp: Date.now(),
				position: {
					x: this.mouse.x,
					y: this.mouse.y,
				},
				isInWindow: true,
				scene: this
			});

			this.mouse.isInWindow = true;
		});

		this.canvasElement.addEventListener("wheel", event => {

			if (event.deltaY < 0) this.mouse.wheelDirection = "up";
			if (event.deltaY > 0) this.mouse.wheelDirection = "down";
			if (event.deltaX < 0) this.mouse.wheelDirection = "left";
			if (event.deltaX > 0) this.mouse.wheelDirection = "right";

			if (typeof this.events["mouseWheel"] === "function") {
				this.events["mouseWheel"](<MouseWheelObject>{
					direction: this.mouse.wheelDirection,
					scene: this,
					timestamp: Date.now()
				});
			}
		});
	}
	private _handleResizeEvents(): void {

		if (this.attributes.includes("keepSizeToWindow")) {

			this.canvasElement.width = window.innerWidth;
			this.canvasElement.height = window.innerHeight;

			this.width = window.innerWidth;
			this.height = window.innerHeight;
		}
	}


	/**
	 * Sets an attribute to this instance, which will have impact on certain behaviors. 
	 * @param attribute Attribute
	 */
	public SetAttribute(attribute: SceneAttributes): SceneAttributes[] {

		if (attribute === "redrawOnResize") console.warn("Warning! This attribute has been deprecated. It will no be supported in the later versions.");

		this.attributes.push(attribute);

		return this.attributes;
	}

	/**
	 * Removes an existing attribute of this instance.
	 * @param attribute
	 */
	public RemoveAttribute(attribute: SceneAttributes): SceneAttributes[] {

		this.attributes.forEach((existingAttribute: SceneAttributes, index: number) => {

			if (attribute === existingAttribute) this.attributes.splice(index, 1);

		});

		return this.attributes;
	}

	/**
	 * Exports the canvas element to an image using a specific
	 * image format. The recommended image format is "png".
	 * 
	 * Will return ``null`` if the given format is unknown.
	 * @param format
	 */
	public ExportToImage(format: SceneImageFormat): null | string {

		if (typeof format === "undefined") return null;

		return this.canvasElement.toDataURL("image/" + format);

	}

	/**
	 * Appends an event listener which will be evoked when any of these event gets triggered. 
	 * 
	 * When an event listener already exists, an error will be returned.
	 * @param event
	 * @param cb
	 */
	public AddEventListener<K extends keyof SceneEventsMap>(event: K, cb: SceneEventsMap[K]): Scene {

		if (typeof this.events[event] === "function") {

			console.warn("Cannot add an event listener to this class instance as an event already exists.");

			return this;
		}

		this.events[event] = cb;

		return this;
	}

	/**
	 * Removes an existing event listener, returning a boolean describing
	 * the state of the removal.
	 * 
	 * @param event
	 */
	public RemoveEventListener<K extends keyof SceneEventsMap>(event: K): boolean {

		if (typeof this.events[event] === "undefined") return false;

		delete this.events[event];

		return true;
	}

	/**
	 * Calculates the fixed mouse position based on the applied camera position
	 * and the mouse position, returning a Vector2 typeof object.
	 * 
	 * Note that if no camera has been applied, the normal mouse position will be returned.
	 */
	public GetFixedMousePosition(): Vector2 {

		if (!this.camera) return {
			x: this.mouse.x,
			y: this.mouse.y
		}

		return {
			x: (this.mouse.x - this.camera.x) / this.camera.scaleX,
			y: (this.mouse.y - this.camera.y) / this.camera.scaleY,
		}
	}

	/**
	 * Calculates the center coordinate of the canvas element
	 * and returns a Vec2 class instance containing the calculated values.
	 * 
	 * Requires no arguments.
	 */
	public Center(): Vec2 {

		const x: number = this.canvasElement.width / 2;
		const y: number = this.canvasElement.height / 2;

		return new Vec2(x, y);
	}

	public GetRandomPosition(): Vec2 {

		return new Vec2(RandomIntBetween(0, this.width), RandomIntBetween(0, this.height));
	}
}