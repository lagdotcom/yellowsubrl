import { KeyPress } from './Sys';
import { Colours, sys } from '../tcod';
import { Tileset } from './Tileset';

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

export enum PrintAlign {
	Left,
	Center,
	Right,
}

export interface BackgroundUpdate {
	x: number;
	y: number;
	colour: string;
	mode: BlendMode;
}

export interface ForegroundUpdate {
	x: number;
	y: number;
	ch: string;
	colour: string;
	mode: BlendMode;
}

export class Console {
	context: CanvasRenderingContext2D;
	element: HTMLCanvasElement;
	bgUpdates: BackgroundUpdate[];
	defaultFg: string;
	fgUpdates: ForegroundUpdate[];
	height: number;
	width: number;
	tileset: Tileset;

	constructor(w: number, h: number, tileset: Tileset) {
		this.width = w;
		this.height = h;
		this.tileset = tileset;

		this.defaultFg = Colours.white;
		this.bgUpdates = [];
		this.fgUpdates = [];

		const canvas = document.createElement('canvas');
		this.element = canvas;
		canvas.width = w * tileset.tileWidth;
		canvas.height = h * tileset.tileHeight;

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.fillStyle = Colours.black;
		context.fillRect(0, 0, canvas.width, canvas.height);
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

	printBox(
		x: number,
		y: number,
		width: number,
		height: number,
		str: string,
		fg: string = '',
		bg: string = '',
		bgBlend: BlendMode = BlendMode.Set,
		alignment: PrintAlign = PrintAlign.Left
	) {
		// TODO: alignment
		if (fg) this.setDefaultForeground(fg);

		const sx = x;
		const sy = y;
		const ex = x + width;
		for (var i = 0; i < str.length; i++) {
			const ch = str[i];

			if (bg) this.setCharBackground(x, y, bg, bgBlend);
			if (fg) this.putChar(x, y, ch);

			x++;
			if (x > ex) {
				x = sx;
				y++;

				// TODO: wrapping stuff
			}
		}

		return y - sy + 1;
	}

	setCharBackground(x: number, y: number, colour: string, mode: BlendMode) {
		this.bgUpdates.push({ x, y, colour, mode });
	}

	setDefaultForeground(col: string) {
		this.defaultFg = col;
	}

	render() {
		const { tileWidth, tileHeight } = this.tileset;

		this.bgUpdates.forEach(u => {
			this.context.globalCompositeOperation = u.mode;
			this.context.fillStyle = u.colour;
			this.context.fillRect(
				u.x * tileWidth,
				u.y * tileHeight,
				tileWidth,
				tileHeight
			);
		});
		this.bgUpdates = [];

		this.fgUpdates.forEach(u => {
			const img = this.tileset.getChar(u.ch, u.colour);
			if (!img) return;

			this.context.globalCompositeOperation = u.mode;
			this.context.drawImage(img, u.x * tileWidth, u.y * tileHeight);
		});
		this.fgUpdates = [];

		return this.element;
	}
}
