import { Vec2 } from "../functions/math";
import { Geometry2DConstructor, Geometry2DStyles, RenderObjectStyles, Vector2 } from "../typings";
import { RenderObject } from "./renderobject";


export class Geometry2D extends RenderObject implements Geometry2DConstructor {

	public width = 20;
	public height = 20;
	public rotation = 0;

	public startPosition: Vector2 = { x: this.width / 2, y: 0 };

	public showBoundary: boolean = false;

	/**
	 * Creates an empty geometry object, which will contain segments.
	 * Those segments can be added, removed or manipulated manually.
	 * 
	 * The outline of the geometry will be linear and the styles will be the same, like for any other renderobject.
	 *  
	 * @param x Base x-axis of the geometry.
	 * @param y Base y-axis of the geometry.
	 * @param segments Array with segments. Enter an empty array to ignore this paramater.
	 * @param styles Styles for the geometry.
	 */
	constructor(public x: number, public y: number, public segments: Vector2[] | Vec2[], styles?: RenderObjectStyles) {
		super();

		this.styles = {...styles};
	}

	/**
	 * Computes the maximum width out of all segments.
	 * 
	 * Negative values ??are not determined as the maximum width.
	 */
	public ComputeMaxGeometryWidth(): number {

		const segmentXValues: number[] = [];

		for (let i = 0; i < this.segments.length; i++) {

			const segment = this.segments[i];

			segmentXValues.push(segment.x);
		}

		return Math.max(...segmentXValues);
	}

	/**
	 * Computes the maximum height out of all segments.
	 * 
	 * Negative values ??are not determined as the maximum height.
	 */
	public ComputeMaxGeometryHeight(): number {

		const segmentYValues: number[] = [];

		for (let i = 0; i < this.segments.length; i++) {

			const segment = this.segments[i];

			segmentYValues.push(segment.y);
		}

		return Math.max(...segmentYValues);
	}

	/**
	 * Automatically sets the width and height of the geometry based on the width and height of the segments. 
	 * 
	 * The in-screen rendering method may not work accurately if the segments contain negative values.
	 * To solve this, try converting the segments to positive numbers.
	 * 
	 * @param setStartPosition Automatically sets the starting position of the geometry based on the first segment in the array.
	 */
	public AutoSetGeometrySize(setStartPosition?: boolean) {

		const maxWidth: number = this.ComputeMaxGeometryWidth();
		const maxHeight: number = this.ComputeMaxGeometryHeight();

		this.width = maxWidth;
		this.height = maxHeight;

		if (setStartPosition) {
			this.startPosition.x = this.segments[0].x;
			this.startPosition.y = this.segments[0].y;
		}

		return this;
	}

	public override Draw(ctx: CanvasRenderingContext2D): number {

		const segments: Vector2[] | Vec2[] = this.segments;

		ctx.save();
		ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
		ctx.rotate(this.rotation * Math.PI / 180);

		RenderObject.ApplyRenderStyles(ctx, this.styles);

		ctx.beginPath();
		ctx.moveTo(this.startPosition.x - (this.width / 2), this.startPosition.y - (this.width / 2));

		for (let i = 0; i < segments.length; i++) {
			const segment: Vector2 | Vec2 = segments[i];
			ctx.lineTo(segment.x - (this.width / 2), segment.y - (this.width / 2));
		}


		if (typeof this.styles.backgroundColor === "string") ctx.fill();
		if (typeof this.styles.borderColor === "string") ctx.stroke();

		ctx.closePath();

		ctx.restore();

		if (this.showBoundary) {
			ctx.save();
			ctx.beginPath();
			ctx.strokeStyle = "red";
			ctx.strokeRect(this.x, this.y, this.width, this.height);
			ctx.restore();
		}

		return 0; 
	}
}
