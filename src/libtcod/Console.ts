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

interface ConsoleTile {
	x: number;
	y: number;
	ch: string;
	fg: string;
	bg: string;
	sx: number;
	sy: number;
	dirty: boolean;
	blend: BlendMode;
}

export class Console {
	context: CanvasRenderingContext2D;
	element: HTMLCanvasElement;
	defaultBg: string;
	defaultBgBlend: BlendMode;
	defaultFg: string;
	height: number;
	width: number;
	tileset: Tileset;
	tiles: ConsoleTile[][];
	tilesFlat: ConsoleTile[];

	constructor(w: number, h: number, tileset: Tileset) {
		this.width = w;
		this.height = h;
		this.tileset = tileset;
		this.defaultBg = Colours.black;
		this.defaultBgBlend = BlendMode.Set;
		this.defaultFg = Colours.white;

		this.tiles = [];
		for (var x = 0; x < w; x++) {
			const col: ConsoleTile[] = [];
			for (var y = 0; y < h; y++)
				col.push({
					x,
					y,
					sx: x * tileset.tileWidth,
					sy: y * tileset.tileHeight,
					dirty: false,
					ch: ' ',
					fg: this.defaultFg,
					bg: this.defaultBg,
					blend: this.defaultBgBlend,
				});
			this.tiles.push(col);
		}
		this.tilesFlat = this.tiles.flat();

		const canvas = document.createElement('canvas');
		this.element = canvas;
		canvas.width = w * tileset.tileWidth;
		canvas.height = h * tileset.tileHeight;

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.fillStyle = this.defaultBg;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	clear(ch: string = ' ', fgc?: string, bgc?: string) {
		const bg = bgc || this.defaultBg;
		const fg = fgc || this.defaultFg;

		this.context.fillStyle = bg;
		this.context.fillRect(0, 0, this.element.width, this.element.height);

		this.tilesFlat.forEach(t => {
			t.ch = ch;
			t.fg = fg;
			t.bg = bg;
			t.blend = this.defaultBgBlend;

			if (ch != ' ') this.drawTile(t);
		});
	}

	setTileset(tileset: Tileset) {
		this.tileset = tileset;

		this.tilesFlat.forEach(t => {
			if (t.ch != ' ') this.drawTile(t);
		});
	}

	checkForKeypress() {
		return sys.checkForEvents(KeyPress).key;
	}

	putChar(x: number, y: number, c: number | string) {
		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;
		const fg = this.defaultFg;
		const tile = this.tiles[x][y];

		if (tile.ch != ch || tile.fg != fg) {
			tile.ch = ch;
			tile.fg = fg;
			tile.dirty = true;
		}
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

	setCharBackground(x: number, y: number, bg: string, mode: BlendMode) {
		const tile = this.tiles[x][y];

		if (tile.bg != bg || tile.blend != mode) {
			tile.bg = bg;
			tile.blend = mode;
			tile.dirty = true;
		}
	}

	setDefaultForeground(col: string) {
		this.defaultFg = col;
	}

	render() {
		this.tilesFlat.forEach(t => {
			if (t.dirty) this.drawTile(t);
		});

		return this.element;
	}

	private drawTile(tile: ConsoleTile) {
		const { tileWidth, tileHeight } = this.tileset;

		tile.dirty = false;

		this.context.globalCompositeOperation = tile.blend;
		this.context.fillStyle = tile.bg;
		this.context.fillRect(tile.sx, tile.sy, tileWidth, tileHeight);

		const img = this.tileset.getChar(tile.ch, tile.fg);
		if (!img) return;

		this.context.globalCompositeOperation = BlendMode.Set;
		this.context.drawImage(img, tile.sx, tile.sy);
	}
}
