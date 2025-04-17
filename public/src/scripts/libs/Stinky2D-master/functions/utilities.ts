import { ConvertByteArrayToHex } from "../constants/colors";
import { SimplifiedImageData } from "../typings";

/**
 * Asynchronous function that stops the program for a certain amount of time and then continues.
 * @param ms Time to continue.
 */
export async function WaitFor(ms: number): Promise<number> {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve(Date.now());
		}, ms);
	});
}

/**
 * Loads an image asynchronously, and returns an HTMLImageElement that can be used as a renderer component.
 * An error is thrown if the source entered does not exist, or the file cannot be accessed.
 * @param url Path of the image.
 * */
export async function LoadImageSync(url: string): Promise<HTMLImageElement> {
	return new Promise(function (resolve, reject) {
		const img = new Image();
		img.src = url;
		img.addEventListener("load", function () {
			resolve(img);
		});
		img.addEventListener("error", function () {
			reject();
		});
	});
}

/**
 * Loads an audio asynchronously, and returns an HTMLAudioElement that can be used to play audio.
 * An error is thrown if the source entered does not exist, or the file cannot be accessed.
 * @param url Path of the audio.
 * */
export async function LoadAudioSync(url: string): Promise<HTMLAudioElement> {
	return new Promise(function (resolve, reject) {
		const audio = document.createElement("audio");
		audio.src = url;
		audio.addEventListener("canplaythrough", function () {
			resolve(audio);
		});
		audio.addEventListener("error", function () {
			reject();
		});
	});
}

/**
 * Simplifies an object containing image data into readable content. 
 */
export function SimplifyImageData(imageData: ImageData): SimplifiedImageData {
	return {
		red: imageData.data[0],
		green: imageData.data[1],
		blue: imageData.data[2],
		alpha: imageData.data[3],
		colorSpace: imageData.colorSpace,
		width: imageData.width,
		height: imageData.height,
		hex: "#" + ConvertByteArrayToHex([imageData.data[0], imageData.data[1], imageData.data[2]]).toUpperCase()
	};
}

export function Bruh() {
	throw new Error("Bruh");
}