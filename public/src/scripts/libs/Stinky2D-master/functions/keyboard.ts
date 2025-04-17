import { InputEvent } from "../typings";

export const ActiveKeys: { [K: string]: boolean } = {};

export const KeyDownListeners: { [K: string]: (ev: InputEvent) => void } = {};
export const KeyUpListeners: { [K: string]: (ev: InputEvent) => void } = {};

/**
 * Listenes on keys being pressed. 
 * @param key Can be a key on any keyboard. For example "w", or "g".
 * @param cb Function that'll be called whenever the given key gets pressed.
 * @returns { boolean }
 */
export function OnKeyDown(key: string, cb: (ev: InputEvent) => void) {

	if (typeof KeyDownListeners[key] === "function") return false;

	KeyDownListeners[key] = cb;

	return true;
}

/**
 * Listenes on keys being released. 
 * @param key Can be a key on any keyboard. For example "w", or "g".
 * @param cb Function that'll be called whenever the given key gets released.
 * @returns { boolean }
 */
export function OnKeyUp(key: string, cb: (ev: InputEvent) => void) {

	if (typeof KeyUpListeners[key] === "function") return false;

	KeyUpListeners[key] = cb;

	return true;
}

/**
 * Returns a boolean representing the down state of a key. 
 * This function can be used within a looper-update event.
 * @param key Can be a key on any keyboard. For example "w", or "g".
 * @returns
 */
export function GetKeyDown(key: string) {

	if (typeof ActiveKeys[key] !== "boolean")
		ActiveKeys[key] = false;

	return ActiveKeys[key];
}


// Immediately start listening on keyboard events.
(function () {

	if (typeof window === "undefined") return;

	window.addEventListener("keydown", function (ev: KeyboardEvent) {

		if (typeof KeyDownListeners[ev.key] === "function") KeyDownListeners[ev.key]({
			key: ev.key,
			mode: "keydown",
			timestamp: Date.now()
		});

		if (typeof ActiveKeys[ev.key] === "boolean")
			ActiveKeys[ev.key] = true;
	});

	window.addEventListener("keyup", function (ev: KeyboardEvent) {

		if (typeof KeyDownListeners[ev.key] === "function") KeyDownListeners[ev.key]({
			key: ev.key,
			mode: "keyup",
			timestamp: Date.now()
		});

		if (typeof ActiveKeys[ev.key] === "boolean")
			ActiveKeys[ev.key] = false;
	});
})();