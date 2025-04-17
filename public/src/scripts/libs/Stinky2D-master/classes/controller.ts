import { UniqueID } from "../functions/uid";
import { GamepadControllerConstructor, GamepadControllerEventMap, GamepadControllerTypeMap, GamepadHandlerConnectEvent, GamepadHandlerConstructor, GamepadHandlerEventMap } from "../typings";
import { Collection } from "./collection";

export class GamepadController implements GamepadControllerConstructor {

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	public updateSpeed: number = 100;
	public start: number = Date.now();

	declare public gamepad: Gamepad;
	declare public gamepadId: string;

	public axes: number[] = [];
	public buttons: GamepadButton[] = [];

	public events: { [K: string]: Function } = {};

	constructor(gamepad: Gamepad) {

		this.gamepad = gamepad;
		this.gamepadId = gamepad.id;

		this.axes = [...this.gamepad.axes];
		this.buttons = [...this.gamepad.buttons];
	}

	public AddEventListener<K extends keyof GamepadControllerEventMap>(event: K, cb: GamepadControllerEventMap[K]) {

		this.events[event] = cb;
	}

	public Update(index: number) {

		const now: number = Date.now();

		if (now <= this.start + this.updateSpeed) return;

		const gamepad: null | Gamepad = navigator.getGamepads()[index - 1];

		if (gamepad === null) return;

		this.gamepad = gamepad;

		this.axes = [...this.gamepad.axes];
		this.buttons = [...this.gamepad.buttons];

		this.start = Date.now();

		if (typeof this.events["update"] === "function")
			this.events["update"]({
				timestamp: Date.now()
			});

		return;
	}

	public ResolveControllerTypeValues<K extends keyof GamepadControllerTypeMap>(type: K): GamepadControllerTypeMap[K] | null {

		switch (type) {
			case "ps4-dual-shock":

				return {
					leftHandedButtons: {
						top: this.buttons[12].touched,
						right: this.buttons[15].touched,
						bottom: this.buttons[13].touched,
						left: this.buttons[14].touched
					},
					rightHandedButtons: {
						triangle: this.buttons[3].touched,
						circle: this.buttons[1].touched,
						cross: this.buttons[0].touched,
						square: this.buttons[2].touched
					},
					leftHandedJoystick: {
						x: this.axes[0],
						y: this.axes[1]
					},
					rightHandedJoystick: {
						x: this.axes[2],
						y: this.axes[3]
					},
					leftHandedJoystickButton: this.buttons[10].touched,
					rightHandedJoystickButton: this.buttons[11].touched,
					playStationButton: this.buttons[16].touched,
					shareButton: this.buttons[8].touched,
					optionsButton: this.buttons[9].touched,
					touchPadButton: this.buttons[17].touched,
					leftHandedBacksideDigitalButton: this.buttons[6].value,
					leftHandedBacksideButton: this.buttons[4].touched,
					rightHandedBacksideDigitalButton: this.buttons[7].value,
					rightHandedBacksideButton: this.buttons[5].touched
				};

				break;
		}

		return null;
	}
}

export class GamepadHandler implements GamepadHandlerConstructor {

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	public controllers: Collection<GamepadController> = new Collection<GamepadController>();

	public events: { [K: string]: Function } = {};

	public foundFirstController: boolean = false;

	constructor(maxControllers?: number) {

		this.controllers.maxSize = maxControllers ? maxControllers : null;

		window.addEventListener("gamepadconnected", event => {

			const controller = new GamepadController(event.gamepad);

			this.controllers.Add(controller);

			if (typeof this.events["connect"] === "function") this.events["connect"](<GamepadHandlerConnectEvent> {
				gamepad: controller,
				id: controller.id,
				timestamp: controller.timestamp
			});
		});
	}

	public AddEventListener<K extends keyof GamepadHandlerEventMap>(event: K, cb: GamepadHandlerEventMap[K]) {

		this.events[event] = cb;
	}

	public Update(deltaTime: number) {

		const l: number = this.controllers.Count;

		for (let i = 0; i < l; i++) {

			const controller: GamepadController = this.controllers.GetElement(i);

			controller.Update(l);
		}
	}

	public async WaitForController(): Promise<null | GamepadController> {

		if (this.foundFirstController) return null;

		return new Promise((resolve, reject) => {

			window.addEventListener("gamepadconnected", event => {

				const controller = new GamepadController(event.gamepad);

				this.controllers.Add(controller);

				resolve(controller);
			});
		});
	}
}