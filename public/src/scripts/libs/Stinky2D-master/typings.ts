import { AudioNode2D } from "./classes/audio-system-2d";
import { GamepadController } from "./classes/controller";
import { RenderObject } from "./classes/renderobject";
import { Scene } from "./classes/scene";
import { Vec2 } from "./functions/math";

export type UniqueIDFilterKeywords = "numbers" | "letters" | "lettersUpperCase" | "lettersLowerCase";
export type DragOffsetType = "center" | "offset";
export type DragMouseButton = "left" | "middle" | "right";
export type EasingName = "easeInQuad" | "easeOutQuad" | "easeInOutQuad" | "easeInCubic" | "easeOutCubic" | "easeInOutCubic" | "easeInQuart" | "easeOutQuart" | "easeInOutQuart" | "easeInQuint" | "easeOutQuint" | "easeInOutQuint" | "easeInSine" | "easeOutSine" | "easeInOutSine" | "easeInExpo" | "easeOutExpo" | "easeInOutExpo" | "easeInCirc" | "easeOutCirc" | "easeInOutCirc" | "easeInElastic" | "easeOutElastic" | "easeInOutElastic" | "easeInBack" | "easeOutBack" | "easeInOutBack" | "easeInBounce" | "easeOutBounce" | "easeInOutBounce";
export type SceneAttributes = "keepSizeToWindow" | "disableContextMenu" | "redrawOnResize";
export type SceneMouseWheelDirection = "up" | "down" | "left" | "right" | null;
export type SceneEvents = "sceneResize" | "mouseDown" | "mouseUp" | "mouseMove" | "mouseOut" | "mouseEnter" | "mouseWheel";
export type SceneImageFormat = "png" | "webp" | "jpeg" | "jpg";
export type LooperEventNames = "update";
export type AudioNode2DEvents = "end" | "play" | "playing" | "pause" | "update" | "load";
export type AudioNode2DControllerNodes = BiquadFilterNode | StereoPannerNode | GainNode | AnalyserNode;
export type AudioNode2DControllerNodeName = "BiquadFilter" | "StereoPanner" | "GainNode" | "AnalyserNode";
export type AudioNode2DAnalyserFFTSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;
export type CollectionElementTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export type RenderObjectDataAttributes = "data-id" | "data-name" | "data-behavior" | "data-timestamp" | "data-appearance" | string;
export type RenderObjectTransformProperty = "hozirontalScaling" | "verticalSkewing" | "horizontalSkewing" | "verticalScaling" | "horizontalTranslation" | "verticalTranslation";
export type RenderMode = "firstToLast" | "lastToFirst";
export type InputType = "keyup" | "keydown";

/*
 * Interface representing an object that will be returned
 * when generating an unique ID.
 * 
 * The object properties are marked as readonly, which cannot 
 * be modified in any way.
 */
export interface GeneratedUniqueIDObject {
	readonly id: string;
	readonly timestamp: number;
	readonly length: number;
}

export interface Vector2 {
	x: number;
	y: number;
}

export interface Vector3 {
	x: number;
	y: number;
	z: number;
}

export interface AtanCalculation {
	base: number;
	cos: number;
	sin: number;
	normalize: () => Vector2;
	complete: () => Vector2;
	multiply: (len: number) => Vector2;
}

/*
 * This interface represents an object with properties
 * based on a generic mouse with three buttons: left, middle and right.
 */
export interface SceneMouseButtonsObject {
	right: boolean;
	middle: boolean;
	left: boolean;
	resetState: () => void;
}

/*
 * This interface represents an object with properties
 * that will automatically be modified by the 'Scene' instance based 
 * on the user their movement.
 */
export interface SceneMouseObject {
	x: number;
	y: number;
	velocityX: number;
	velocityY: number;
	lastTimestamp: number;
	wheelDirection: SceneMouseWheelDirection;
	isInWindow: boolean;
	buttons: SceneMouseButtonsObject;
	checkObjectEntry: (x: number, y: number, range: number) => boolean;
	isDragging?: boolean;
}

export interface MouseWheelObject {
	readonly direction: SceneMouseWheelDirection;
	readonly timestamp: number;
	readonly scene: SceneConstructor;
}

export interface MouseMoveObject {
	readonly x: number;
	readonly y: number;
	readonly velocityX: number;
	readonly velocityY: number;
	readonly timestamp: number;
	readonly lastTimestamp: number;
	readonly scene: SceneConstructor;
}

export interface MouseDownObject {
	readonly buttons: SceneMouseButtonsObject;
	readonly timestamp: number;
	readonly scene: SceneConstructor;
}

export interface MouseUpObject {
	readonly buttons: SceneMouseButtonsObject;
	readonly timestamp: number;
	readonly scene: SceneConstructor;
}

export interface MouseOutObject {
	readonly timestamp: number;
	readonly lastPosition: Vector2;
	readonly scene: SceneConstructor;
	readonly isInWindow: boolean;
}

export interface MouseEnterObject {
	readonly timestamp: number;
	readonly position: Vector2;
	readonly scene: SceneConstructor;
	readonly isInWindow: boolean;
}

/*
 * Interface that will be implemented in the 'Scene' class.
 * This interface specifies the standard class members.
 */
export interface SceneConstructor {
	width: number;
	height: number;
	canvasElement: HTMLCanvasElement;
	domElement: HTMLElement;
	renderer?: RendererConstructor;
	camera?: CameraConstructor;
}
/*
 * Interface that will be implemented in a 'RenderObject' class instance,
 * including standard specified class members.
 * 
 */
export interface RenderObjectConstructor {
	id: string;
	exisitingObjectCount: number;
	timestamp: number;
}

/*
 * Interface that represents an object that can be used
 * while constructing a 'Renderer' class instance, this to
 * specific renderer attributes.
 */
export interface RendererAttributes {
	alpha?: boolean;
	willReadFrequently?: boolean;
	desynchronized?: boolean;
}

/*
 * Interface that will be implemented in a 'Renderer' class instance,
 * including standard specified class members.
 */
export interface RendererConstructor {
	id: string;
	timestamp: number;
	context: CanvasRenderingContext2D;
	scene: SceneConstructor;
	attributes: RendererAttributes;
	renderObjects: RenderObjectConstructor[];
	visibleRenderObjects: RenderObjectConstructor[];
	transform: number[] | null;
	camera?: CameraConstructor;
}

export interface Rendering {
	startedAt: number;
	endedAt: number;
	duration: number;
	renderedAmountOfObjects: number;
}

export interface CameraConstructor {
	renderer: RendererConstructor;
	ctx: CanvasRenderingContext2D;
	scene: SceneConstructor;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	offScreenRendering: boolean;
	lastOffset: Vector2;
}

/*
 * Interface representing an object with transform matrices,
 * that eventually can be used in all graphic components.
 */
export interface TransformMatrices {
	horizontalSkewing: number;
	verticalSkewing: number;
	horizontalScaling: number;
	verticalScaling: number;
	horizontalTranslation: number;
	verticalTranslation: number;
}

/*
 * This interface represents an object with possible style properties
 * that will be used on a graphical render component.
 */
export interface RenderObjectStyles {
	backgroundColor?: string | number[];
	backgroundImage?: HTMLImageElement;
	filter?: string;
	opacity?: number;
	globalCompositeOperation?: GlobalCompositeOperation;
	imageSmoothingEnabled?: boolean;
	imageSmoothingQuality?: ImageSmoothingQuality;
	borderWidth?: number;
	borderColor?: string | number[];
	shadowBlur?: number;
	shadowColor?: string | number[];
	shadowOffsetX?: number;
	shadowOffsetY?: number;
	direction?: CanvasDirection;
	font?: string;
	textColor?: string;
	textStrokeColor?: string;
	lineCap?: CanvasLineCap;
	lineDashOffset?: number;
	lineJoin?: CanvasLineJoin;
	miterLimit?: number;
	textAlign?: CanvasTextAlign;
	textBaseline?: CanvasTextBaseline;
	strokeColor?: string;
	strokeWidth?: number;
	lineWidth?: number;
}

export interface RenderObjectStyleApplyingResults {
	startedAt: number;
	endedAt: number;
	duration: number;
}

export interface LooperConstructor {
	id: string;
	renderer: RendererConstructor;
}

/*
 * Interface representing an object that will be returned from the 'Tick' method
 * of a 'Looper' instance, with properties defining the frame-rate, last registered timestamp,
 * the delta-time and the perfect set frame-rate which is 60 frames by default.
 */
export interface LooperOnUpdateEvent {
	readonly frameRate: number;
	readonly lastTimestamp: number;
	readonly deltaTime: number;
	readonly perfectFrameRate: number;
	readonly now: number;
}

export interface LooperEvents {
	update: ((ev: LooperOnUpdateEvent) => void)[];
}

export interface RectangleConstructor {
	id: string;
	timestamp: number;
	x: number;
	y: number;
	height: number;
	width: number;
	styles: RenderObjectStyles;
}

export interface RenderObjectDragConfiguration {
	isEnabled: boolean;
	offsetType: DragOffsetType | null;
	scene: SceneConstructor | null;
	button: DragMouseButton;
}

export interface TextConstructor {
	text: string;
	showBoundary: boolean;
}

export interface CircleConstructor {
	x: number;
	y: number;
	radius: number;
	startRadian: number;
	endRadian: number;
	counterClockwise: boolean;
}

export interface Geometry2DConstructor {
	segments: Vector2[];
}

export interface Geometry2DStyles {
	backgroundColor?: string;
	borderColor?: string;
}

export interface Line2DConstructor {
	from: Vector2;
	to: Vector2;
	styles: RenderObjectStyles;
	id: string;
}

export interface LineSystem2DOptions {
	maxLines?: number;
}

export interface LineSystem2DConstructor {
	options: LineSystem2DOptions;
	lines: Line2DConstructor[];
}

export interface Dimension2D {
	width?: number;
	height?: number;
	radius?: number;
}

export interface SpritesheetControllerConstructor {
	frames: HTMLImageElement[];
	duration: number;
	frameDimension: Dimension2D;
	loop: boolean;
	frameDuration: number;
}

export interface SpritesheetControllerEventObject {
	reset?: (timestamp: number) => void;
	play?: (timestamp: number) => void;
	pause?: (timestamp: number) => void;
	update?: (timestamp: number) => void;
	detach?: (timestamp: number) => void;
	attach?: (timestamp: number) => void;
}

export interface AudioSystem2DConstructor {
	maxAudioNodes: number;
	ctx: AudioContext;
	gain: GainNode;
	panner: StereoPannerNode;
	id: string;
	nodes: AudioSystem2DConstructor[] | AudioNode2D[];
}

export interface AudioNode2DConstructor {
	ctx: AudioContext;
	id: string;
	timestamp: number;
	x: number;
	y: number;
	range: number;
	events: {[event in AudioNode2DEvents]?: () => void};
}

export interface SimplifiedImageData {
	readonly red: number;
	readonly green: number;
	readonly blue: number;
	readonly alpha: number;
	readonly colorSpace: PredefinedColorSpace;
	readonly width: number;
	readonly height: number;
	readonly hex: string;
}

export interface RigidBody2DConstructor {
	id: string;
	timestamp: number;
}

export interface PhysicsWorld2DConstructor {
	readonly id: string;
	readonly timestamp: number;
}

export interface SceneResizeEventFunction {
	readonly bruh: any;
}

export interface SceneMouseDownEvent {
	readonly button: SceneMouseButtonsObject;
	readonly timestamp: number;
	readonly scene: Scene | SceneConstructor;
}

export interface SceneMouseUpEvent {
	readonly button: SceneMouseButtonsObject;
	readonly timestamp: number;
	readonly scene: Scene | SceneConstructor;
}

export interface SceneMouseMoveEvent {
	readonly timestamp: number;
	readonly lastTimestamp: number;
	readonly scene: Scene | SceneConstructor;
	readonly x: number;
	readonly y: number;
	readonly velocityX: number;
	readonly velocityY: number;
}

export interface SceneMouseOutEvent {
	readonly timestamp: number;
	readonly lastPosition: Vector2;
	readonly isInWindow: boolean;
	readonly scene: Scene | SceneConstructor;
}

export interface SceneMouseEnterEvent {
	readonly timestamp: number;
	readonly lastPosition: Vector2;
	readonly isInWindow: boolean;
	readonly scene: Scene | SceneConstructor;
}

export interface SceneMouseWheelEvent {
	readonly direction: SceneMouseWheelDirection;
	scene: Scene | SceneConstructor;
	timestamp: number;
}

export interface SceneEventsMap {
	"sceneResize": (ev: SceneResizeEventFunction) => void;  
	"mouseDown": (ev: SceneMouseDownEvent) => void;
	"mouseUp": (ev: SceneMouseUpEvent) => void;
	"mouseMove": (ev: SceneMouseMoveEvent) => void;
	"mouseOut": (ev: SceneMouseOutEvent) => void;
	"mouseEnter": (ev: SceneMouseEnterEvent) => void;
	"mouseWheel": (ev: SceneMouseWheelEvent) => void;
}

export interface RenderObjectMouseDownEvent {
	readonly target: RenderObject;
	readonly mousePosition: Vector2;
	readonly mouse: SceneMouseObject;
}

export interface RenderObjectMouseOutEvent {
	readonly target: RenderObject;
	readonly mousePosition: Vector2;
	readonly mouse: SceneMouseObject;
}

export interface RenderObjectMouseEnterEvent {
	readonly target: RenderObject;
	readonly mousePosition: Vector2;
	readonly mouse: SceneMouseObject;
}

export interface RenderObjectMouseWheelEvent {
	readonly target: RenderObject;
	readonly mousePosition: Vector2;
	readonly mouse: SceneMouseObject;
}

export interface RenderObjectRenderEvent {
	readonly target: RenderObject;
	readonly timestamp: number;
}


export interface RenderObjectEventMap {
	"mouseDown": (ev: RenderObjectMouseDownEvent) => void;
	"mouseUp": Function;
	"mouseMove": Function;
	"mouseOut": (ev: RenderObjectMouseOutEvent) => void;
	"mouseEnter": (ev: RenderObjectMouseEnterEvent) => void;
	"mouseClick": Function;
	"mouseWheel": (ev: RenderObjectMouseWheelEvent) => void;
	"render": (ev: RenderObjectRenderEvent) => void;
	"update": Function;
	"exist": Function;
	"destroy": Function;
}

export interface GamepadControllerConstructor {
	id: string;
	timestamp: number;
	gamepad: Gamepad;
	gamepadId: string;
}

export interface GamepadHandlerConstructor {
	id: string;
	timestamp: number;
	events: {[K: string]: Function};
}

export interface GamepadHandlerConnectEvent {
	gamepad: GamepadController;
	timestamp: number;
	id: string;
}

export interface GamepadHandlerEventMap {
	"connect": (ev: GamepadHandlerConnectEvent) => void;
	"disconnect": Function;
}

export interface GamepadControllerUpdateEvent {
	timestamp: number;
}

export interface GamepadControllerEventMap {
	"update": (ev: GamepadControllerUpdateEvent) => void;
}

export interface GamepadControllerUniversalDirectionalButtons {
	top: boolean;
	left: boolean;
	right: boolean;
	bottom: boolean;
}

export interface PS4DualShockRightButtonsMap {
	triangle: boolean;
	circle: boolean;
	cross: boolean;
	square: boolean;
}

export interface PS4DualShockMap {
	leftHandedButtons: GamepadControllerUniversalDirectionalButtons;
	rightHandedButtons: PS4DualShockRightButtonsMap;
	leftHandedJoystick: Vector2;
	rightHandedJoystick: Vector2;
	leftHandedJoystickButton: boolean;
	rightHandedJoystickButton: boolean;
	playStationButton: boolean;
	shareButton: boolean;
	optionsButton: boolean;
	touchPadButton: boolean;
	leftHandedBacksideDigitalButton: number;
	leftHandedBacksideButton: boolean;
	rightHandedBacksideDigitalButton: number;
	rightHandedBacksideButton: boolean;
}

export interface GamepadControllerTypeMap {
	"ps4-dual-shock": PS4DualShockMap;
}

export interface CompressorPreset {
	threshold: number;
	knee: number;
	ratio: number;
	attack: number;
	release: number;
}

export interface CompressorPresetsMap {
	"master-no-clip": CompressorPreset;
}

export interface CopyRenderingOptions {
	opacity?: number;
	imageSmoothingEnabled?: boolean;
}

export interface InputEvent {
	readonly timestamp: number;
	readonly key: string;
	readonly mode: InputType;
}

export interface CameraFocusAnimation {
	animationName: EasingName;
	animationDuration: number;
}

declare global {
	interface Window {
		Stinky2D: any;
		RenderingOptions: any;
		EngineFlags: any;
	}

	interface String {
		readonly bruh: () => void;
	}
}
