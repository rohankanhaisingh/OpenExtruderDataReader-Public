import { GetAverageArrayValue } from "../functions/math";
import { UniqueID } from "../functions/uid";
import { SceneConstructor } from "../typings";
import { Renderer } from "./renderer";
import { Scene } from "./scene";

export class OffscreenRenderer {

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	public scalingFactor: number = 1;

	public glowFilter: string | null = null;

	declare public ctx: CanvasRenderingContext2D;
	declare public canvas: HTMLCanvasElement;

	/**
	 * An offscreen renderer can be used to post process
	 * existing visuals from other renderers.
	 * 
	 * This renderer can process several filters such as
	 * bloom, glow, contrast, down- and upscaling and many more.
	 */
	constructor() {

		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d", { alpha: true, willReadFrequently: true, colorSpace: "display-p3" } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D;

		this.canvas.width = 800;
		this.canvas.height = 600;
	}

	/**
	 * Sets the scaling factor based on a renderer. 
	 * The lower the scaling factor, the lower the quality gets.
	 * 
	 * A higher scaling factor may decrease the performance.
	 * @param renderer
	 * @param scalingFactor
	 */
	public SetDynamicScalingFactor(renderer: Renderer, scalingFactor: number) {

		this.scalingFactor = scalingFactor;

		this.canvas.width = renderer.scene.width * scalingFactor;
		this.canvas.height = renderer.scene.height * scalingFactor;
	}

	/**
	 * Pre-generates a texture with all the effecs applied,
	 * which later can be used by a rendere to draw it as a layer.
	 * The more effects are applied, the longer it can take to
	 * process the effects. 
	 * 
	 * Downscaling might be useful.
	 * @param renderer
	 */
	public CreateTexture(renderer: Renderer) {

		const ctx: CanvasRenderingContext2D = this.ctx;
		const canvas: HTMLCanvasElement = this.canvas;

		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (this.glowFilter !== null)
			ctx.filter = this.glowFilter;

		ctx.drawImage(renderer.scene.canvasElement, 0, 0, canvas.width, canvas.height);

		ctx.restore();
	}

	/**
	 * Use the glow effect as part of the post-processing effect collection.
	 * @param blurStrength
	 * @param brightness
	 */
	public UseGlowEffect(blurStrength: number, brightness: number) {

		this.glowFilter = `blur(${blurStrength}px) brightness(${brightness * 100}%)`;
	}

	public CopyTexture(renderer: Renderer) {

	
	}
}