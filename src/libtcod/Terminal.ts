import { Console } from './Console';
import { Colours } from '../tcod';

function opt<T>(option: T | undefined, def: T) {
	return option !== undefined ? option : def;
}

export const KeyDown = 'keydown',
	KeyPress = 'keypress',
	KeyUp = 'keyup',
	MouseDown = 'mousedown',
	MouseMove = 'mousemove';

export interface TerminalKey {
	type: string;
	key: string;
	keyCode: number;
	alt: boolean;
	ctrl: boolean;
	shift: boolean;
}

export interface TerminalMouse {
	type: string;
	button: number;
	x: number;
	y: number;
}

export class Terminal {
	callback?: FrameRequestCallback;
	context: CanvasRenderingContext2D;
	element: HTMLCanvasElement;
	handle: number;
	height: number;
	keyEvents: TerminalKey[];
	mouseEvent?: TerminalMouse;
	offsetX: number;
	offsetY: number;
	redraw: boolean;
	running: boolean;
	scaleX: number;
	scaleY: number;
	tileWidth: number;
	tileHeight: number;
	width: number;

	constructor(w: number, h: number, tw: number, th: number) {
		this.width = w;
		this.height = h;
		this.tileWidth = tw;
		this.tileHeight = th;
		this.keyEvents = [];

		const canvas = document.createElement('canvas');
		this.element = canvas;
		this.redraw = false;
		canvas.tabIndex = 1;
		window.addEventListener('resize', () => this.resize());
		requestAnimationFrame(() => {
			canvas.focus();
			this.resize();
		});
		document.body.appendChild(canvas);

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.fillStyle = Colours.black;
		context.fillRect(0, 0, canvas.width, canvas.height);

		this.offsetX = 0;
		this.offsetY = 0;
		this.scaleX = 1;
		this.scaleY = 1;

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		this.tick = this.tick.bind(this);
		this.running = true;
		this.handle = 0;
		this.schedule();
	}

	private resize() {
		this.redraw = true;
		this.width = this.element.width = this.element.clientWidth;
		this.height = this.element.height = this.element.clientHeight;
	}

	listen(
		...events: ('keydown' | 'keypress' | 'keyup' | 'mousemove' | 'mousedown')[]
	) {
		if (events.includes(KeyDown))
			this.element.addEventListener('keydown', this.onKeyDown);
		else this.element.removeEventListener('keydown', this.onKeyDown);

		if (events.includes(KeyPress))
			this.element.addEventListener('keypress', this.onKeyPress);
		else this.element.removeEventListener('keypress', this.onKeyPress);

		if (events.includes(KeyUp))
			this.element.addEventListener('keyup', this.onKeyUp);
		else this.element.removeEventListener('keyup', this.onKeyUp);

		if (events.includes(MouseMove))
			this.element.addEventListener('mousemove', this.onMouseMove);
		else this.element.removeEventListener('mousemove', this.onMouseMove);

		if (events.includes(MouseDown))
			this.element.addEventListener('mousedown', this.onMouseDown);
		else this.element.removeEventListener('mousemove', this.onMouseDown);
	}

	present(
		console: Console,
		options: {
			keepAspect?: boolean;
			integerScaling?: boolean;
			clearColour?: string;
			align?: [number, number];
		} = {}
	) {
		const keepAspect = opt(options.keepAspect, true);
		const integerScaling = opt(options.integerScaling, true);
		const clearColour = opt(options.clearColour, 'black');
		const align = opt(options.align, [0.5, 0.5]);

		const { tileWidth, tileHeight } = console.tileset;
		var consoleW, consoleH;

		if (this.redraw) {
			const { width, height } = this;

			var scaleX = width / console.cols / tileWidth;
			var scaleY = height / console.rows / tileHeight;

			if (integerScaling) {
				scaleX = Math.max(1, Math.floor(scaleX));
				scaleY = Math.max(1, Math.floor(scaleY));
			}

			if (keepAspect) {
				scaleX = Math.min(scaleX, scaleY);
				scaleY = scaleX;
			}

			const consoleWidth = scaleX * console.cols * tileWidth;
			const consoleHeight = scaleY * console.rows * tileHeight;

			this.offsetX = Math.floor((width - consoleWidth) * align[0]);
			this.offsetY = Math.floor((height - consoleHeight) * align[1]);
			this.scaleX = scaleX;
			this.scaleY = scaleY;

			this.context.fillStyle = clearColour;
			this.context.fillRect(0, 0, width, height);
			this.redraw = false;

			consoleW = consoleWidth;
			consoleH = consoleHeight;
		} else {
			consoleW = this.scaleX * console.cols * tileWidth;
			consoleH = this.scaleY * console.rows * tileHeight;
		}

		const src = console.render();
		this.context.drawImage(
			src,
			0,
			0,
			src.width,
			src.height,
			this.offsetX,
			this.offsetY,
			consoleW,
			consoleH
		);
	}

	main(f: FrameRequestCallback) {
		this.callback = f;
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.handle);
	}

	pixelToTile(wx: number, wy: number): [number, number] {
		const ox = wx - this.element.offsetLeft - this.offsetX;
		const oy = wy - this.element.offsetTop - this.offsetY;

		const tw = this.tileWidth * this.scaleX;
		const th = this.tileHeight * this.scaleY;

		return [Math.floor(ox / tw), Math.floor(oy / th)];
	}

	checkForEvents() {
		const key = this.keyEvents.shift();
		const mouse = this.mouseEvent;
		this.mouseEvent = undefined;

		return { key, mouse };
	}

	private schedule() {
		if (this.running) this.handle = requestAnimationFrame(this.tick);
	}

	private tick(time: number) {
		this.callback && this.callback(time);
		this.schedule();
	}

	private onKeyDown(e: KeyboardEvent) {
		this.keyEvents.push({
			type: KeyDown,
			key: e.key,
			keyCode: e.keyCode,
			alt: e.altKey,
			ctrl: e.ctrlKey,
			shift: e.shiftKey,
		});
	}

	private onKeyUp(e: KeyboardEvent) {
		this.keyEvents.push({
			type: KeyUp,
			key: e.key,
			keyCode: e.keyCode,
			alt: e.altKey,
			ctrl: e.ctrlKey,
			shift: e.shiftKey,
		});
	}

	private onKeyPress(e: KeyboardEvent) {
		this.keyEvents.push({
			type: KeyPress,
			key: e.key,
			keyCode: e.keyCode,
			alt: e.altKey,
			ctrl: e.ctrlKey,
			shift: e.shiftKey,
		});
	}

	private onMouseDown(e: MouseEvent) {
		const [x, y] = this.pixelToTile(e.x, e.y);

		this.mouseEvent = {
			type: MouseDown,
			button: e.button,
			x,
			y,
		};
	}

	private onMouseMove(e: MouseEvent) {
		const [x, y] = this.pixelToTile(e.x, e.y);

		if (this.mouseEvent) {
			this.mouseEvent.x = x;
			this.mouseEvent.y = y;
		} else {
			this.mouseEvent = {
				type: MouseMove,
				button: 0,
				x,
				y,
			};
		}
	}
}
