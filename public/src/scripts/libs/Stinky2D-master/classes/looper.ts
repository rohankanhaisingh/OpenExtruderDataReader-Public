import { UniqueID } from "../functions/uid";
import { LooperConstructor, LooperEventNames, LooperEvents, LooperOnUpdateEvent, RendererConstructor } from "../typings";
import { Renderer } from "./renderer";

export class Looper implements LooperConstructor {

	public id = UniqueID(18).id;

	public animationFrame: number = 0;
	public frameRate: number = 0;
	public deltaTime: number = 0;
	public lastTimestamp: number = Date.now();

	public perfectFrameRate = 60;

	public times: number[] = [];

	public events: LooperEvents = {
		update: []
	}

	declare public renderer: Renderer | RendererConstructor;

	/**
	 * Creates an looper instance, which will update itself every possible requested frame
	 * using the ``window.requestAnimationFrame`` function.
	 * @param renderer
	 */
	constructor(renderer?: Renderer | RendererConstructor) {

		if(renderer) this.renderer = renderer;

	}

	private _tick(timestamp: number): LooperOnUpdateEvent {

		this.animationFrame = window.requestAnimationFrame((d: number) => this._tick(d))

		const now: number = performance.now();

		this.deltaTime = (now - this.lastTimestamp) / (1000 / this.perfectFrameRate);

		this.lastTimestamp = now;

		while (this.times.length > 0 && this.times[0] <= now - 1000) this.times.shift();

		this.times.push(now);
		this.frameRate = this.times.length;

		const state: LooperOnUpdateEvent = {
			now: now,
			deltaTime: this.deltaTime,
			frameRate: this.frameRate,
			lastTimestamp: this.lastTimestamp,
			perfectFrameRate: this.perfectFrameRate
		}

		if (this.renderer instanceof Renderer) { this.renderer.ClearScene(); this.renderer.RenderObjectsInCamera(this.deltaTime); }
		for (let i = 0; i < this.events.update.length; i++) { let updateEvent = this.events.update[i]; if (typeof updateEvent === "function") updateEvent(state); }

		return state; 
	}

	/**This will manually trigger the loop of this instance. */
	public Trigger(): Looper {

		this._tick(performance.now());

		return this;
	}

	/**
	 * Appends an event listener for events whose type attribute value is type. 
	 * The callback argument sets the callback that will be evoked when any of these events gets triggered.
	 * @param event Event name
	 * @param cb Callback function
	 */
	public AddEventListener(event: LooperEventNames, cb: (state: LooperOnUpdateEvent) => void): Looper {

		switch (event) {
			case "update":

				this.events.update.push(cb);

				break;
		}

		return this;
	}
}
