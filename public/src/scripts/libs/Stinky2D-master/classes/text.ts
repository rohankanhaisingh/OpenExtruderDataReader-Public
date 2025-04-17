import { RenderObjectStyles, TextConstructor } from "../typings";
import { RenderObject } from "./renderobject";

export class TextNode extends RenderObject implements TextConstructor {

	public text: string = "";
	public showBoundary: boolean = false;

	public width = 10;
	public height = 10;

	public rotation = 0;

	/**
	Creates a new TextNode instance.
	@param {string} text - The text content of the node.
	@param {number} x - The x-coordinate of the node's position.
	@param {number} y - The y-coordinate of the node's position.
	@param {number | null} width - The width of the text node. If null, default width of 10 will be used.
	@param {number | null} height - The height of the text node. If null, default height of 10 will be used.
	@param {RenderObjectStyles} [styles] - The styles to be applied to the text node.
	*/
	constructor(text: string, x: number, y: number, width: number | null, height: number | null, styles?: RenderObjectStyles) {
		super();

		this.text = text;

		this.x = x;
		this.y = y;

		this.width = typeof width === "number" ? width : 10;
		this.height = typeof height === "number" ? height : 10;

		this.styles = { ...styles };
	}

	public override Draw(ctx: CanvasRenderingContext2D): number {

		ctx.save();
		ctx.beginPath();

		RenderObject.ApplyRenderStyles(ctx, this.styles);

		ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
		ctx.rotate(this.rotation * Math.PI / 180);

		if (typeof this.styles.textColor === "string" || typeof this.styles.backgroundColor === "string") 
			ctx.fillText(this.text, 0 - (this.width / 2), 0 - (this.height / 2));

		if (typeof this.styles.textStrokeColor === "string" || typeof this.styles.borderColor === "string")
			ctx.strokeText(this.text, 0 - (this.width / 2), 0 - (this.height / 2));

		ctx.restore();

		if (!this.showBoundary) return 0;

		ctx.save();
		ctx.beginPath();

		ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
		ctx.rotate(this.rotation * Math.PI / 180);

		ctx.strokeStyle = "red";
		ctx.strokeRect(0 - (this.width / 2), 0 - (this.height / 2), this.width, this.height);

		ctx.restore();

		return 0;
	}

	public override Update(ctx: CanvasRenderingContext2D, deltaTime: number): number {

		return 0;
	}
}