import { Vec2 } from "../functions/math";
import { UniqueID } from "../functions/uid";
import { Line2DConstructor, LineSystem2DConstructor, LineSystem2DOptions, RenderObjectStyles, Vector2 } from "../typings";
import { RenderObject } from "./renderobject";

export class Line2D implements Line2DConstructor {

	public id: string = UniqueID(18).id;

	declare public from: Vector2;
	declare public to: Vector2;
	declare public styles: RenderObjectStyles;

	constructor(from: Vector2 | Vec2, to: Vector2 | Vec2, styles: RenderObjectStyles) {

		this.from = from;
		this.to = to;
		this.styles = styles;

	}
}

export class LineSystem2D extends RenderObject implements LineSystem2DConstructor{

	public options = {};
	public lines: Line2DConstructor[] | Line2D[] = [];

	public width = 10;
	public height = 10;

	/**
	 * Creates a 2 dimensional line system. 
	 * Every line added to this system will be shown in the scene. 
	 * 
	 * The dimension should be adjusted manually.
	 * It can also be set automatically.
	 * 
	 * @param x x-axis of the line system.
	 * @param y y-axis of the line system.
	 */
	constructor(x: number, y: number, options?: LineSystem2DOptions) {
		super();

		this.x = x;
		this.y = y;

		this.options = { ...options };

		if (typeof options === "undefined") this.options = {maxLines: 50};
	}

	public override Draw(ctx: CanvasRenderingContext2D): number {

		if (this.lines.length === 0) return 0;

		ctx.save();

		const lines = this.lines;

		for (let i = 0; i < lines.length; i++) {

			const line = lines[i];

			ctx.save();
			ctx.beginPath();
			ctx.moveTo(this.x + line.from.x, this.y + line.from.y);
			ctx.lineTo(this.x + line.to.x, this.y + line.to.y);

			RenderObject.ApplyRenderStyles(ctx, line.styles);

			if (typeof line.styles.borderColor === "string" || typeof line.styles.strokeColor === "string") ctx.stroke();

			ctx.restore();
		}

		ctx.restore();

		return 0;
	}

	/**
	 * Adds a 2 dimensional line to the 2D line system.
	 * 
	 * @param line Line that will be added to this system.
	*/
	public AddLine2D(line: Line2D | Line2DConstructor): LineSystem2D {

		if (!(line instanceof Line2D)) throw new Error("Cannot add line because argument is not a Line2D class, or has a Line2DConstructor interface.");

		this.lines.push(line);

		return this;
	}

	/**
	 * Sets a specific style property to all lines added to this line system.
	 * The property must be a property within the RenderObjectStyles interface.
	 * 
	 * For detailed information about the style properties, read the documentation for the RenderObjectStyles interface.
	 * 
	 * @param property Style property
	 * @param value Style value.
	 */
	public SetStyleOnLines(property: keyof RenderObjectStyles, value: any): LineSystem2D {

		if (this.lines.length === 0) return this;

		const lines = this.lines;

		for (let i = 0; i < lines.length; i++) {

			const line: Line2DConstructor | Line2D = lines[i];

			line.styles[property] = value;

		}

		return this;
	}

	/** Destroys all the lines added to this system. */
	public DestroyAllLines(): LineSystem2D {

		this.lines = [];

		return this;
	}

	/** Destroys a specific line class in this system, returning a boolean representing the result of the destruction. */
	public DestroyLine(line: Line2D | Line2DConstructor): boolean {

		if (this.lines.length === 0) return false;

		const lines = this.lines;

		for (let i = 0; i < lines.length; i++) {

			const _line = lines[i];

			if (line.id === _line.id) {

				this.lines.splice(i, 1);

				return true;
			}

		}


		return false;
	}

	/**
	 * Gets a random line instance added to this instance.
	 * 
	 * Will return null if no lines has been added.
	 */
	public GetRandomLineInstance(): Line2D | Line2DConstructor | null {

		if (this.lines.length === 0) return null;

		const lines = this.lines;
		const randomNumber: number = Math.floor(Math.random() * lines.length);

		return lines[randomNumber];
	}
}