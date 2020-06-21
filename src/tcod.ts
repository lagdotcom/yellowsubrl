export enum BlendMode {
	None = 'source-over', // TODO?
	Set = 'source-over', // TODO?
	Multiply = 'multiply',
	Lighten = 'lighten',
	Darken = 'darken',
	Screen = 'screen',
	ColourDodge = 'color-dodge',
	ColourBurn = 'color-burn',
	// Add,
	// AddA,
	// Burn,
	Overlay = 'overlay',
	// Alph,
	Default = Set,
}

type SysEventType =
	| 'FingerMove'
	| 'FingerPress'
	| 'FingerRelease'
	| 'KeyPress'
	| 'KeyRelease'
	| 'MouseMove'
	| 'MousePress'
	| 'MouseRelease';
export const FingerMove = 'FingerMove',
	FingerPress = 'FingerPress',
	FingerRelease = 'FingerRelease',
	KeyPress = 'KeyPress',
	KeyRelease = 'KeyRelease',
	MouseMove = 'MouseMove',
	MousePress = 'MousePress',
	MouseRelease = 'MouseRelease';
export const FingerEvents: SysEventType[] = [
	FingerMove,
	FingerPress,
	FingerRelease,
];
export const KeyEvents: SysEventType[] = [KeyPress, KeyRelease];
export const MouseEvents: SysEventType[] = [
	MouseMove,
	MousePress,
	MouseRelease,
];

export function toRGB(r: number, g: number, b: number) {
	return `rgb(${r},${g},${b})`;
}

export const Colours = {
	black: toRGB(0, 0, 0),
	white: toRGB(255, 255, 255),
	red: toRGB(255, 0, 0),
	yellow: toRGB(255, 255, 0),
};

const tcodLayout = [
	` !"#$%&'()*+,-./0123456789:;<=>?`,
	'@[\\]%_`{|}~░▒▓│─┼┤┴├┬└┌┐┘▘▝▀▗▚▐▖',
	'⭡⭣⭠⭢⯅⯆⯇⯈⭥⭤☐☑⭘⭗║═╬╣╩╠╦╚╔╗╝',
	'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	'abcdefghijklmnopqrstuvwxyz',
	'',
	'',
	'',
];

export enum Charmap {
	TCOD,
}

export class Tileset {
	canvas: HTMLCanvasElement;
	charmap: Charmap;
	context: CanvasRenderingContext2D;
	layout: string[];
	lookup: { [ch: string]: [number, number] };
	src: CanvasImageSource;
	height: number;
	width: number;

	static async createFromUrl(
		source: string,
		columns: number,
		rows: number,
		charmap: Charmap
	) {
		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const el = document.createElement('img');
			el.onerror = e => {
				reject(e);
			};
			el.onload = () => {
				resolve(el);
			};
			el.src = source;
		});

		return new Tileset(img, charmap, columns, rows);
	}

	constructor(
		src: HTMLImageElement,
		charmap: Charmap,
		rows: number,
		cols: number
	) {
		this.charmap = charmap;

		if (charmap == Charmap.TCOD) this.layout = tcodLayout;
		else throw 'Unsupported charmap';

		// get the tile size
		const { width, height } = src;
		this.width = width / rows;
		this.height = height / cols;

		const mask = document.createElement('canvas');
		mask.width = width;
		mask.height = height;
		const context = mask.getContext('2d');
		if (!context) throw "Can't process tilesheet";

		context.drawImage(src, 0, 0);
		const data = context.getImageData(0, 0, width, height);
		for (var i = 0; i < data.data.length; i += 4)
			data.data[i + 3] = data.data[i];

		context.putImageData(data, 0, 0);
		this.src = mask;

		// process the lookup table
		this.lookup = {};
		for (var row = 0; row < this.layout.length; row++) {
			for (var col = 0; col < this.layout[row].length; col++) {
				this.lookup[this.layout[row][col]] = [
					col * this.width,
					row * this.height,
				];
			}
		}

		// reserve a canvas for text drawing
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw 'Could not reserve canvas for text drawing';
		this.context = ctx;
	}

	getChar(ch: string, fg: string) {
		const loc = this.lookup[ch];
		if (!loc) return undefined;

		const { canvas, context, src, width, height } = this;

		context.globalCompositeOperation = 'copy';
		context.fillStyle = fg;
		context.fillRect(0, 0, width, height);

		context.globalCompositeOperation = 'destination-in';
		context.drawImage(src, loc[0], loc[1], width, height, 0, 0, width, height);

		return canvas;
	}
}

interface BackgroundUpdate {
	x: number;
	y: number;
	colour: string;
	mode: BlendMode;
}

interface ForegroundUpdate {
	x: number;
	y: number;
	ch: string;
	colour: string;
	mode: BlendMode;
}

export class Console {
	bgUpdates: BackgroundUpdate[];
	defaultFg: string;
	fgUpdates: ForegroundUpdate[];
	height: number;
	width: number;

	constructor(w: number, h: number) {
		this.width = w;
		this.height = h;

		this.defaultFg = Colours.white;
		this.bgUpdates = [];
		this.fgUpdates = [];
	}

	checkForKeypress() {
		return sys.checkForEvents(KeyPress).key;
	}

	putChar(
		x: number,
		y: number,
		c: number | string,
		mode: BlendMode = BlendMode.Default
	) {
		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;
		this.fgUpdates.push({
			x,
			y,
			ch,
			mode,
			colour: this.defaultFg,
		});
	}

	printRect(x: number, y: number, w: number, h: number, s: string) {
		const sx = x;
		const ex = x + w;
		for (var i = 0; i < s.length; i++) {
			const ch = s[i];
			this.putChar(x, y, ch);

			x++;
			if (x > ex) {
				x = sx;
				y++;

				// TODO: wrapping stuff
			}
		}
	}

	setCharBackground(x: number, y: number, colour: string, mode: BlendMode) {
		this.bgUpdates.push({ x, y, colour, mode });
	}

	setDefaultForeground(col: string) {
		this.defaultFg = col;
	}
}

export class Terminal {
	callback?: Function;
	context: CanvasRenderingContext2D;
	element: HTMLCanvasElement;
	width: number;
	handle: number;
	height: number;
	running: boolean;
	tileset: Tileset;

	constructor(w: number, h: number, tileset: Tileset) {
		this.width = w;
		this.height = h;
		this.tileset = tileset;

		this.element = document.createElement('canvas');
		this.element.width = w * tileset.width;
		this.element.height = h * tileset.height;
		document.body.appendChild(this.element);
		sys.addConsole(this.element);

		const context = this.element.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.imageSmoothingEnabled = false;
		context.fillStyle = Colours.black;
		context.fillRect(0, 0, this.element.width, this.element.height);

		this.tick = this.tick.bind(this);
		this.running = true;
		this.handle = 0;
		this.schedule();
	}

	present(con: Console) {
		const { width, height } = this.tileset;

		con.bgUpdates.forEach(u => {
			const dx = u.x * width,
				dy = u.y * height;

			this.context.globalCompositeOperation = u.mode;
			this.context.fillStyle = u.colour;
			this.context.fillRect(dx, dy, width, height);
		});
		con.bgUpdates = [];

		con.fgUpdates.forEach(u => {
			const dx = u.x * width,
				dy = u.y * height;

			const img = this.tileset.getChar(u.ch, u.colour);
			if (!img) return;

			this.context.globalCompositeOperation = u.mode;
			this.context.drawImage(img, dx, dy);
		});
		con.fgUpdates = [];
	}

	main(f: Function) {
		this.callback = f;
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.handle);
	}

	private schedule() {
		if (this.running) this.handle = requestAnimationFrame(this.tick);
	}

	private tick() {
		this.callback && this.callback(this);
		this.schedule();
	}
}

export interface SysKeyEvent {
	type: 'KeyPress' | 'KeyRelease';
	key: string;
	keyCode: number;
	lalt: boolean;
}

export interface SysMouseEvent {
	type: 'MouseMove' | 'MousePress' | 'MouseRelease';
	button: number;
	x: number;
	y: number;
}

export interface SysFingerEvent {
	type: 'FingerMove' | 'FingerPress' | 'FingerRelease';
	x: number;
	y: number;
}

export interface Key {
	key: string;
	keyCode: number;
}

interface SysEvents {
	key?: SysKeyEvent;
	mouse?: SysMouseEvent;
	finger?: SysFingerEvent;
}

class Sys {
	key: SysKeyEvent[];
	mouse: SysMouseEvent[];
	finger: SysFingerEvent[];

	constructor() {
		this.key = [];
		this.mouse = [];
		this.finger = [];

		this.addConsole(document.body);
	}

	addConsole(el: HTMLElement) {
		el.addEventListener('keypress', e => {
			this.key.push({
				type: KeyPress,
				key: e.key,
				keyCode: e.keyCode,
				lalt: e.altKey,
			});
		});

		el.addEventListener('keyup', e => {
			this.key.push({
				type: KeyRelease,
				key: e.key,
				keyCode: e.keyCode,
				lalt: e.altKey,
			});
		});
	}

	checkForEvents(type: SysEventType | SysEventType[]) {
		const events: SysEvents = {};
		const types = typeof type === 'string' ? [type] : type;

		if (types.includes('KeyPress') || types.includes('KeyRelease')) {
			events.key = this.key.shift();
		}

		if (
			types.includes('MouseMove') ||
			types.includes('MousePress') ||
			types.includes('MouseRelease')
		) {
			events.mouse = this.mouse.shift();
		}

		if (
			types.includes('FingerMove') ||
			types.includes('FingerPress') ||
			types.includes('FingerRelease')
		) {
			events.finger = this.finger.shift();
		}

		return events;
	}
}

export const sys = new Sys();
