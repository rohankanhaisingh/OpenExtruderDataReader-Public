//import path from "path";
//import fs from "fs";

//import { app } from "electron";

//import { Camera } from "../classes/camera";
//import { Looper } from "../classes/looper";
//import { Renderer } from "../classes/renderer";
//import { RenderObject } from "../classes/renderobject";
//import { Scene } from "../classes/scene";

//// Import inbuilt functions
//import { InbuiltFunction } from "./inbuilt-function";
//import GetProgram from "./functions/Get-Program";

//const reservedKeywords: string[] = ["function", "if", "else", "for"];

//const inbuiltFunctions: { [K: string]: any } = {
//	"Get-Program": new GetProgram()
//};

//const inbuiltVariables: { [K: string]: any } = {
//	"Application": app
//};

//function checkInbuiltFunction(functionName: string): InbuiltFunction | null {

//	let foundFunction = false;

//	for (let key in inbuiltFunctions) {

//		if (key === functionName) {

//			const func: any = inbuiltFunctions[key];

//			if (!(func instanceof InbuiltFunction))
//				throw new Error(`Function '${functionName}' has not been declared as a function.`);

//			return func;
//		}
//	}

//	return null;
//}

//function lexer(line: string) {

//	const lineContent: string = line.trim();

//	if (lineContent.startsWith("#") || lineContent.length === 0) return;

//	const words: string[] = lineContent.split(" "),
//		command: string = words[0];

//	if (command.startsWith("$"))
//		return console.log(command);

//	const func: InbuiltFunction | null = checkInbuiltFunction(command);

//	console.log(func?.Execute());
//}

//function readProgram(source: string) {

//	const lines: string[] = source.split("\n");

//	let currentLine: number = 0,
//		maxLines: number = lines.length;

//	for (let i = 0; i < maxLines; i += 1) {

//		currentLine = i;

//		const line: string = lines[currentLine];

//		lexer(line);
//	}
//}

//export class Stage {

//	declare public scene: Scene;
//	declare public renderer: Renderer;
//	declare public camera: Camera;
//	declare public looper: Looper;

//	declare public renderObjects: RenderObject[];

//	constructor() {

//	}

//	async SetupStage() {

//	} 

//	async LoadStage(filePath: string) {

//		if (!fs.existsSync(filePath))
//			throw new Error(`The given file (${filePath}) does not exist, or may have been moved.`);

//		const fileContents: string = fs.readFileSync(filePath, { encoding: "utf-8" });

//		readProgram(fileContents);
//	}
//}