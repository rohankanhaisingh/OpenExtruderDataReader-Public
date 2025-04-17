import { CameraConstructor, CopyRenderingOptions, RendererAttributes, RendererConstructor, Rendering, RenderMode, RenderObjectDataAttributes, RenderObjectTransformProperty, SceneConstructor, TransformMatrices, UniqueIDFilterKeywords } from "../typings";
import { Scene } from "./scene";
import { UniqueID } from "../functions/uid";
import { Camera } from "./camera";
import { RenderObject } from "./renderobject";
import { SpritesheetController } from "./spritesheet-controller";
import { Collection } from "./collection";
import { OffscreenRenderer } from "./offscreen-renderer";

export class Renderer implements RendererConstructor {

	public id = UniqueID(18).id;
	public timestamp = Date.now();
	public renderObjects: RenderObject[] = [];
	public visibleRenderObjects: RenderObject[] = [];

	public attributes = {};

	public transform: number[] | null = null;

	public picking: boolean = false;
	public pickDelay: number = 100;
	public lastPicked: number = Date.now();

	declare public scene: Scene | SceneConstructor;
	declare public context: CanvasRenderingContext2D;
	declare public camera: Camera | CameraConstructor | undefined;

	/**
	 * By creating a 'renderer' instance, the program can draw images.
	 * This must be manually linked to a 'Scene' instance. If not, no graphics can be displayed
	 * @param scene The scene that will be linked to the renderer.
	 * @param attributes Attributes specifying the behaviour of the renderer.
	 */
	constructor(scene: Scene | SceneConstructor, attributes?: RendererAttributes) {

		this.scene = scene;
		this.attributes = { ...attributes };
		this.context = scene.canvasElement.getContext("2d", attributes) as CanvasRenderingContext2D;

		(scene as SceneConstructor).renderer = this;

		window.Stinky2D[this.id] = this;
	}

	/** Clears the entire scene, which will end up showing a black scene. */
	public ClearScene(): Renderer {

		const ctx: CanvasRenderingContext2D = this.context;
		const scene = this.scene;

		ctx.clearRect(0, 0, scene.width, scene.height);

		return this;
	}

	/**
	 * This method paints the entire scene using the given color. 
	 * This method does not work together with the 'ClearScene' method
	 * 
	 * Note that everything will be erased once this method is used.
	 * It will also erase when the window has been resized.
	 * @param color Color used for painting.
	 */
	public PaintScene(color: string) {

		const ctx = this.context;
		const scene = this.scene;

		ctx.save();
		ctx.beginPath();

		ctx.rect(0, 0, scene.width, scene.height);

		ctx.fillStyle = color;
		ctx.fill();

		ctx.closePath();
		ctx.restore();

		return this;
	}

	/** Render all objects in conjunction with the camera linked to this instance */
	public RenderObjectsInCamera(deltaTime: number, renderMode?: RenderMode): Rendering {

		if (!(this.camera instanceof Camera)) throw new Error("Cannot render objects in camera since no camera has been specified.");

		const results: Rendering = {
			startedAt: Date.now(),
			endedAt: 0,
			duration: 0,
			renderedAmountOfObjects: 0
		}

		const ctx: CanvasRenderingContext2D = this.context;
		const camera: Camera = this.camera;
		const visibleObjects: RenderObject[] = [];

		ctx.save();

		if (this.transform !== null)
			ctx.transform(this.transform[0], this.transform[1], this.transform[2], this.transform[3], this.transform[4], this.transform[5]);

		ctx.translate(camera.x, camera.y);
		ctx.scale(camera.scaleX, camera.scaleY);

		let i = 0;

		while (i < this.renderObjects.length) {

			const obj: RenderObject = this.renderObjects[i];
			if (!this.camera.offScreenRendering) {

				if (typeof obj.width === "number" && typeof obj.height === "number") {

					if (!obj.forceRendering) {
						if (obj.x > -(((this.camera.x + 30) / this.camera.scaleX) + (obj.width)) && obj.x < -((this.camera.x - this.camera.width) / this.camera.scaleX) &&
							obj.y > -((this.camera.y + 30) / this.camera.scaleY) && obj.y < -((this.camera.y - (this.camera.height))) / this.camera.scaleY) {

							visibleObjects.push(obj);

							obj.visible = true;

							if (typeof obj.Draw === "function") obj.Draw(this.context);
							if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);

							if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

						} else {
							obj.visible = false;
						}
					} else {

						if (typeof obj.Draw === "function") obj.Draw(this.context);
						if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
						if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

						visibleObjects.push(obj);

						obj.visible = false;
					}

				}

				if (typeof obj.radius === "number") {

					if (!obj.forceRendering) {
						if (obj.x > -(((this.camera.x + 30) / this.camera.scaleX) + (obj.radius)) && obj.x < -((this.camera.x - this.camera.width) / this.camera.scaleX) &&
							obj.y > -((this.camera.y + 30) / this.camera.scaleY) && obj.y < -((this.camera.y - (this.camera.height))) / this.camera.scaleY) {

							visibleObjects.push(obj);

							obj.visible = true;

							if (typeof obj.Draw === "function") obj.Draw(this.context);
							if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
							if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

						} else {
							obj.visible = false;
						}
					} else {

						if (typeof obj.Draw === "function") obj.Draw(this.context);
						if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
						if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

						visibleObjects.push(obj);

						obj.visible = false;
					}

				}

			} else {

				if (typeof obj.Draw === "function") obj.Draw(this.context);
				if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
				if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);
			}

			i += 1;
		}

		this.visibleRenderObjects = visibleObjects;

		if (this.picking) {

			const now = Date.now();

			if (now > this.lastPicked + this.pickDelay) {

				
				this.lastPicked = now;
			}

		}

		ctx.restore();

		results.renderedAmountOfObjects = visibleObjects.length;
		results.endedAt = Date.now();
		results.duration = results.endedAt - results.startedAt;


		return results;
	}

	public RenderCopiedTexture(target: HTMLCanvasElement | OffscreenRenderer, options?: CopyRenderingOptions) {

		let canvas: HTMLCanvasElement | null = null;

		if (target instanceof OffscreenRenderer) 
			canvas = target.canvas;

		if (target instanceof HTMLCanvasElement)
				canvas = target;

		if (canvas === null)
			throw new Error("Cannot renderer copied texture.");

		const ctx: CanvasRenderingContext2D = this.context;
		const _options = {...options};

		ctx.save();

		ctx.globalAlpha = typeof _options.opacity === "number" ? _options.opacity : 1;
		ctx.imageSmoothingEnabled = typeof _options.imageSmoothingEnabled === "boolean" ? _options.imageSmoothingEnabled : true;

		ctx.globalCompositeOperation = 'lighter';

		ctx.drawImage(canvas, 0, 0, this.scene.width, this.scene.height);

		ctx.globalCompositeOperation = 'source-over';

		ctx.restore();
	}

	/** Renders a specific render object. Throws an error if no camera instance has been applied to this renderer. */
	public Render(renderObject: RenderObject, deltaTime: number) {

		if (!(this.camera instanceof Camera)) throw new Error("Cannot render objects in camera since no camera has been specified.");

		const results: Rendering = {
			startedAt: Date.now(),
			endedAt: 0,
			duration: 0,
			renderedAmountOfObjects: 0
		}

		const ctx: CanvasRenderingContext2D = this.context;
		const camera: Camera = this.camera;

		ctx.save();

		if (this.transform !== null)
			ctx.transform(this.transform[0], this.transform[1], this.transform[2], this.transform[3], this.transform[4], this.transform[5]);

		ctx.translate(camera.x, camera.y);
		ctx.scale(camera.scaleX, camera.scaleY);

		const obj: RenderObject = renderObject;

		if (!this.camera.offScreenRendering) {

			if (typeof obj.width === "number" && typeof obj.height === "number") {

				if (!obj.forceRendering) {
					if (obj.x > -(((this.camera.x + 30) / this.camera.scaleX) + (obj.width)) && obj.x < -((this.camera.x - this.camera.width) / this.camera.scaleX) &&
						obj.y > -((this.camera.y + 30) / this.camera.scaleY) && obj.y < -((this.camera.y - (this.camera.height))) / this.camera.scaleY) {
						obj.visible = true;

						if (typeof obj.Draw === "function") obj.Draw(this.context);
						if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);

						if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

					} else {
						obj.visible = false;
					}
				} else {

					if (typeof obj.Draw === "function") obj.Draw(this.context);
					if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
					if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);


					obj.visible = false;
				}

			}

			if (typeof obj.radius === "number") {

				if (!obj.forceRendering) {
					if (obj.x > -(((this.camera.x + 30) / this.camera.scaleX) + (obj.radius)) && obj.x < -((this.camera.x - this.camera.width) / this.camera.scaleX) &&
						obj.y > -((this.camera.y + 30) / this.camera.scaleY) && obj.y < -((this.camera.y - (this.camera.height))) / this.camera.scaleY) {

						obj.visible = true;

						if (typeof obj.Draw === "function") obj.Draw(this.context);
						if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
						if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

					} else {
						obj.visible = false;
					}
				} else {

					if (typeof obj.Draw === "function") obj.Draw(this.context);
					if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
					if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);

					obj.visible = false;
				}

			}

		} else {

			if (typeof obj.Draw === "function") obj.Draw(this.context);
			if (typeof obj.Update === "function") obj.Update(this.context, deltaTime);
			if (obj.spritesheetController as SpritesheetController) (obj.spritesheetController as SpritesheetController).Update(deltaTime);
		}


		if (this.picking) {

			const now = Date.now();

			if (now > this.lastPicked + this.pickDelay) this.lastPicked = now;
		}

		ctx.restore();

		results.endedAt = Date.now();
		results.duration = results.endedAt - results.startedAt;


		return results;

	}

	/**
	 * Adds a render object to this renderer instance.
	 * 
	 * An error might be thrown if an instance already has been added to this renderer.
	 * @param renderObject 
	*/
	public Add(renderObject: RenderObject): RenderObject {

		let hasFoundObject: boolean = false;

		for (let i = 0; i < this.renderObjects.length; i++) {

			const foundObject: RenderObject = this.renderObjects[i];

			if (foundObject.id === renderObject.id) hasFoundObject = true;
		}

		if (hasFoundObject) throw new Error(`Failed to add renderobject (objectID: ${renderObject.id}) to renderer since it has already been added.`);

		renderObject.scene = this.scene as Scene;
		renderObject.renderer = this as Renderer;

		renderObject.arrayIndex = this.renderObjects.length;
		this.renderObjects.push(renderObject);

		renderObject.OnAdd(this);

		return renderObject;
	}

	/**Enables the ability to analyze the colors in the rendered image */
	public EnablePicking(): boolean {
		this.lastPicked = Date.now();
		return this.picking = true;
	}

	/**Disables the ability to analyze the colors in the rendered image */
	public DisablePicking(): boolean {
		this.lastPicked = Date.now();
		return this.picking = false;
	} 

	/** 
	 *  Sets a delay in which the rendered image is analyzed
	 *	The default value is 100.
	 *	
	 *	Does not accept float numbers.
	 * 
	 * @param delay Delay in milliseconds.
	 */
	public SetPickDelay(delay: number): number {
		return this.pickDelay = delay;
	}

	/**
	 * 
	 * This method returns an ImageData object representing the underlying pixel data for a specified portion of the canvas
	 * using the CanvasRenderingContext2D.getImageData method.
	 * 
	 * If the rendered image is analyzed multiple times, make sure the 'willReadFrequently' option is enabled when building a 'Renderer' class.
	 * The greater the value of the desired width and height of the analysis, the more time it will take to perform the analysis.
	 * WebGL can be used to make the analysis faster, through the graphics card.
	 * */
	public GetImageData(startX: number, startY: number, width: number, height: number, colorSpace?: PredefinedColorSpace): ImageData {

		return this.context.getImageData(startX, startY, width, height, {
			colorSpace: colorSpace ? colorSpace : "display-p3"
		});
	}

	public Destroy(renderObject: RenderObject): Renderer {

		for (let i = 0; i < this.renderObjects.length; i++) {
			const obj = this.renderObjects[i];

			if (obj.id === renderObject.id) {

				this.renderObjects.splice(i, 1);

				break;
			}
		}

		return this;
	}

	/**
	 * Searches a render object by filtering specific attributes and checking the 
	 * value if they match the entered values.
	 * 
	 * This method returns either the found render object stored in an array, or null 
	 * if no object has been found.
	 * 
	 * The returning array with render objects can automatically be stored in a Collection
	 * instance if the argument 'useCollection' is set to true.
	 * */
	public GetObjectByDataAttribute(attributeName: RenderObjectDataAttributes, attributeValue: string, useCollection?: boolean): RenderObject[] | Collection<RenderObject> | null {

		const objects: RenderObject[] = this.renderObjects;

		const foundObjects: RenderObject[] = [];

		for (const object of objects) {

			if (typeof object.attributes[attributeName] === "string") {

				if (object.attributes[attributeName] === attributeValue) {

					foundObjects.push(object);
				}
			}
		}

		if (foundObjects.length === 0) return null;

		return useCollection === true ? new Collection<RenderObject>(foundObjects) : foundObjects;
	}

	public QuerySelector(selector: string) {

	}

	/**
	 Sets the transformation matrix for the renderer.
	 
	 @param {number} horizontalScaling - The horizontal scaling factor.
	 @param {number} verticalSkewing - The vertical skewing factor.
	 @param {number} horizontalSkewing - The horizontal skewing factor.
	 @param {number} verticalScaling - The vertical scaling factor.
	 @param {number} horizontalTranslation - The horizontal translation value.
	 @param {number} verticalTranslation - The vertical translation value.
	 @returns {Renderer} - The updated renderer object.
	*/
	public SetTransform(
		horizontalScaling: number,
		verticalSkewing: number,
		horizontalSkewing: number,
		verticalScaling: number,
		horizontalTranslation: number,
		verticalTranslation: number
	): Renderer {

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

	/**
	 * Sets a specific transform property on the whole renderer itself.
	 * 
	 * */
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
}
