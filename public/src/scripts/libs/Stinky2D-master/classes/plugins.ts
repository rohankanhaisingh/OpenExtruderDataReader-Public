import { AnimateInteger } from "../functions/math";
import { UniqueID } from "../functions/uid";
import { RenderObjectStyles } from "../typings";
import { Circle } from "./circle";
import { Rectangle } from "./rectangle";
import { Renderer } from "./renderer";
import { RenderObject } from "./renderobject";


export namespace Plugins {

	export class Toggle extends RenderObject {

		declare public body: Rectangle;
		declare public thumb: Circle;

		public isActive: boolean = false;

		public padding: number = 5;
		public thumbRadius: number = 10;

		constructor(x: number, y: number, width: number, height: number, bodyStyles: RenderObjectStyles, thumbStyles: RenderObjectStyles) {
			super();

			this.x = x;
			this.y = y;

			this.width = width;
			this.height = height;

			const thumbDistance: number = (height / 2) - this.thumbRadius;

			this.body = new Rectangle(x - this.padding, y - this.padding, width + (this.padding * 2), height + (this.padding * 2), bodyStyles);
			this.thumb = new Circle(x + this.thumbRadius + thumbDistance, y + this.thumbRadius + thumbDistance, this.thumbRadius, 0, 360, false, thumbStyles);

			this.body.AddEventListener("mouseDown", () => {

				if (!this.isActive) {

					AnimateInteger(this.height / 2, this.width - (this.height / 2), "easeOutBack", 500, value => {

						this.thumb.x = this.x + value;
					});

					this.isActive = true;
				} else {

					AnimateInteger(this.width - (this.height / 2), this.height / 2, "easeOutBack", 500, value => {

						this.thumb.x = this.x + value;
					});

					this.isActive = false;
				}
			});
		}

		public override SetPosition(x: number, y: number): RenderObject {

			if (typeof this.x !== "number") throw new Error("Cannot set x-axis of object, as it does not exist or is not a number.");
			if (typeof this.y !== "number") throw new Error("Cannot set y-axis of object, as it does not exist or is not a number.");

			const thumbYDistance: number = (this.height / 2) - this.thumbRadius;

			this.x = x;
			this.y = y;

			this.body.x = this.x - this.padding;
			this.body.y = this.y - this.padding;

			this.thumb.x = this.isActive ? this.x + this.width - (this.height / 2) : this.x + (this.height / 2);
			this.thumb.y = this.y + this.thumbRadius + thumbYDistance;

			return this;
		}

		public override OnAdd(renderer: Renderer) {

			renderer.Add(this.body);
			renderer.Add(this.thumb);
		}
	}
}