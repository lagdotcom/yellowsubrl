export enum FontFlags {
	LayoutASCIIInCol = 1,
	LayoutASCIIInRow = 2,
	TypeGreyscale = 4,
	LayoutTCOD = 8,
	LayoutCP437 = 16,
}

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

class Font {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	flags: FontFlags;
	layout: string[];
	lookup: { [ch: string]: [number, number] };
	src: CanvasImageSource;
	height: number;
	width: number;

	constructor(
		src: HTMLImageElement,
		flags: FontFlags,
		chars_x?: number,
		chars_y?: number
	) {
		this.flags = flags;

		if (flags & FontFlags.LayoutTCOD) this.layout = tcodLayout;
		else throw 'Unsupported font layout';

		// get the font size
		const { width, height } = src;
		this.width = width / (chars_x || this.layout[0].length);
		this.height = height / (chars_y || this.layout.length);

		// turn image data into a mask
		if (flags & FontFlags.TypeGreyscale) {
			const mask = document.createElement('canvas');
			mask.width = width;
			mask.height = height;
			const context = mask.getContext('2d');
			if (!context) throw "Can't process font";

			context.drawImage(src, 0, 0);
			const data = context.getImageData(0, 0, width, height);
			for (var i = 0; i < data.data.length; i += 4)
				data.data[i + 3] = data.data[i];

			context.putImageData(data, 0, 0);
			this.src = mask;
		} else throw 'Unsupported font type';

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

interface ConsoleUpdate {
	x: number;
	y: number;
	ch: string;
	fg: string;
	bg: string;
	mode: BlendMode;
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

class Console {
	callback?: (con: Console) => any;
	context: CanvasRenderingContext2D;
	default_bg: string;
	default_fg: string;
	element: HTMLCanvasElement;
	font: Font;
	handle: number;
	height: number;
	running: boolean;
	updates: ConsoleUpdate[];
	width: number;

	constructor(w: number, h: number, f: Font) {
		this.width = w;
		this.height = h;
		this.font = f;

		this.element = document.createElement('canvas');
		this.element.width = w * f.width;
		this.element.height = h * f.height;
		document.body.appendChild(this.element);
		sys.addConsole(this.element);

		this.default_bg = Colours.black;
		this.default_fg = Colours.white;
		this.updates = [];

		const context = this.element.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.imageSmoothingEnabled = false;
		context.fillStyle = this.default_bg;
		context.fillRect(0, 0, this.element.width, this.element.height);

		this.tick = this.tick.bind(this);
		this.running = true;
		this.handle = 0;
		this.schedule();
	}

	check_for_keypress() {
		return sys.check_for_event(KeyEvents).key;
	}

	flush() {
		const updates = this.updates.slice();
		updates.forEach(u => {
			const { width, height } = this.font;
			const dx = u.x * width,
				dy = u.y * height;

			this.context.globalCompositeOperation = 'source-over';
			this.context.fillStyle = u.bg;
			this.context.fillRect(dx, dy, width, height);

			const img = this.font.getChar(u.ch, u.fg);
			if (!img) return;

			this.context.globalCompositeOperation = u.mode;
			this.context.drawImage(img, dx, dy);
		});

		this.updates = [];
	}

	main(fn: (con: Console) => any) {
		this.callback = fn.bind(this);
	}

	put_char(
		x: number,
		y: number,
		c: number | string,
		mode: BlendMode = BlendMode.Default
	) {
		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;
		this.updates.push({
			x,
			y,
			ch,
			mode,
			fg: this.default_fg,
			bg: this.default_bg,
		});
	}

	print_rect(x: number, y: number, w: number, h: number, s: string) {
		const sx = x;
		const ex = x + w;
		for (var i = 0; i < s.length; i++) {
			const ch = s[i];
			this.put_char(x, y, ch);

			x++;
			if (x > ex) {
				x = sx;
				y++;

				// TODO: wrapping stuff
			}
		}
	}

	set_default_foreground(col: string) {
		this.default_fg = col;
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

export async function console_set_custom_font(
	fontFile: string,
	flags: FontFlags,
	nb_char_horiz = 0,
	nb_char_vertic = 0
) {
	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const el = document.createElement('img');
		el.onerror = e => {
			reject(e);
		};
		el.onload = () => {
			resolve(el);
		};
		el.src = fontFile;
	});

	return new Font(img, flags, nb_char_horiz, nb_char_vertic);
}

export function console_init_root(w: number, h: number, font: Font) {
	const con = new Console(w, h, font);

	(window as any).tcodCon = con;
	return con;
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

	check_for_event(type: SysEventType | SysEventType[]) {
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
