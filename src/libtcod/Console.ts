import { KeyPress } from './Sys';
import { Colours, sys } from '../tcod';

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
