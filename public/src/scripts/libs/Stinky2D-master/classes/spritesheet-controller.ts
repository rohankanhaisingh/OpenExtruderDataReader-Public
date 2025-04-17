import { UniqueID } from "../functions/uid";
import { Dimension2D, SpritesheetControllerConstructor, SpritesheetControllerEventObject } from "../typings";
import { RenderObject } from "./renderobject";

export class SpritesheetController implements SpritesheetControllerConstructor {

	declare public frames: HTMLImageElement[];
	declare public frameDimension: Dimension2D;

	declare public loop: boolean;
	declare public paused: boolean;
	
	declare public duration: number;
	declare public frameDuration: number;

	declare public start: number;

	declare public attachedRenderObject?: RenderObject;

	public id = UniqueID(18).id;
	public events: SpritesheetControllerEventObject = {}
	public frame = 0;

	constructor(frames: HTMLImageElement[], renderObject: RenderObject) {

		this.frames = frames;
		this.duration = 1000;
		this.frameDimension = { width: 100, height: 100 };

		this.paused = false;
		this.loop = false;

		this.start = Date.now();

		this.attachedRenderObject = renderObject;
		renderObject.spritesheetController = this;
	}

	public Reset(): SpritesheetController {

		this.start = Date.now();

		if (typeof this.events.reset === "function") this.events.reset(Date.now());

		return this;
	}

	/**Updates the controller by a renderer. */
	public Update(deltaTime: number) {

		if (!this.attachedRenderObject) return;

		const now = Date.now();
		const frameDuration = Math.floor(this.duration / (this.frames.length - 1));
		const elapsedTime = now - this.start;

		const frame = Math.round(elapsedTime / frameDuration);

		this.frameDuration = frameDuration;

		if (elapsedTime < this.duration) {

			if (!this.paused) {

				if (typeof this.events.update === "function") this.events.update(Date.now());
				
				this.frame = frame;
				this.attachedRenderObject.styles.backgroundImage = this.frames[frame];
			}
		} else {

			if (this.loop) this.Reset();
		}
	}

	/** Pauses the controller */
	public Pause(): SpritesheetController {

		if (!this.paused) this.paused = true;

		if (typeof this.events.pause === "function") this.events.pause(Date.now());

		return this;
	}

	/** Continues playing the controller */
	public Play(): SpritesheetController {

		if (this.paused) this.paused = false;

		if (typeof this.events.play === "function") this.events.play(Date.now());

		return this;
	}

	/** Detaches the controller from the attached render object. */
	public Detach(): SpritesheetController {

		if (!this.attachedRenderObject) throw new Error("Cannot detach spritesheet controller since there is none attached.");

		if (typeof this.events.detach === "function") this.events.detach(Date.now());

		this.attachedRenderObject.spritesheetController;
		this.attachedRenderObject = undefined;

		return this;
	}

	/** Attaches the controller to a render object. */
	public Attach(renderObject: RenderObject): SpritesheetController {

		if (this.attachedRenderObject) throw new Error("Cannot attach spritesheet controller with given render object because it already has one.");

		this.attachedRenderObject = renderObject;
		renderObject.spritesheetController = this;

		return this;
	}

	/**
	 * Adds an event listener on this controller, where the callback method will be fired when any of the events gets triggered. 
	 * 
	 * @param event Event name
	 * @param callback Callback function when the event triggers.
	 */
	public AddEventListener(event: keyof SpritesheetControllerEventObject, callback: (timestamp: number) => void): SpritesheetController {

		this.events[event] = callback;

		return this;
	}
}