import { Colours } from '../tcod';
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

	contains(x: number, y: number) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
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
		this.element.width = this.width * tileset.tileWidth;
		this.element.height = this.height * tileset.tileHeight;

		this.tilesFlat.forEach(t => {
			this.drawTile(t);
		});
	}

	putChar(x: number, y: number, c: number | string) {
		if (!this.contains(x, y)) return;

		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;
		const fg = this.defaultFg;
		const tile = this.tiles[x][y];

		if (tile.ch != ch || tile.fg != fg) {
			tile.ch = ch;
			tile.fg = fg;
			tile.dirty = true;
		}
	}

	print(x: number, y: number, str: string) {
		return this.printBox(
			x,
			y,
			str.length,
			1,
			str,
			this.defaultFg,
			this.defaultBg,
			this.defaultBgBlend
		);
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
		if (fg) this.setDefaultForeground(fg);

		const lines = this.splitLines(width, height, str);
		lines.forEach((line, ly) => {
			var lx = 0;

			if (alignment == PrintAlign.Right) lx = width - line.length;
			else if (alignment == PrintAlign.Center)
				lx = Math.floor((width - line.length) / 2);

			for (var i = 0; i < line.length; i++) {
				const ch = line[i];
				if (bg) this.setCharBackground(x + lx, y + ly, bg, bgBlend);
				if (fg) this.putChar(x + lx, y + ly, ch);

				lx++;
			}
		});

		return lines.length;
	}

	drawRect(
		sx: number,
		sy: number,
		width: number,
		height: number,
		c?: string | number,
		fg?: string,
		bg?: string,
		blend: BlendMode = BlendMode.Set
	) {
		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;

		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				if (fg && ch) this.setCharForeground(sx + x, sy + y, fg, ch);
				if (bg) this.setCharBackground(sx + x, sy + y, bg, blend);
			}
		}
	}

	setCharForeground(x: number, y: number, fg: string, ch: string) {
		const tile = this.tiles[x][y];

		if (tile.fg != fg || tile.ch != ch) {
			tile.fg = fg;
			tile.ch = ch;
			tile.dirty = true;
		}
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

	blit(
		dest: Console,
		dx: number,
		dy: number,
		sx: number = 0,
		sy: number = 0,
		width: number = 0,
		height: number = 0
	) {
		width = width || this.width;
		height = height || this.height;

		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				const st = this.tiles[sx + x][sy + y];

				dest.setCharBackground(dx + x, dy + y, st.bg, st.blend);
				dest.setCharForeground(dx + x, dy + y, st.fg, st.ch);
			}
		}
	}

	render() {
		this.tilesFlat.forEach(t => {
			if (t.dirty) this.drawTile(t);
		});

		return this.element;
	}

	getHeightRect(
		x: number,
		y: number,
		width: number,
		height: number,
		str: string
	) {
		const lines = str.split('\n');
		var height = 0;
		lines.forEach(line => {
			height += Math.ceil(line.length / width);
		});

		return height + lines.length - 1;
	}

	private splitLines(width: number, height: number, str: string) {
		const lines = [];
		var cline = '';
		var x = 0;
		var y = 0;

		for (var i = 0; i < str.length; i++) {
			const ch = str[i];

			if (ch != '\n') {
				if (ch != ' ' || x) {
					cline += ch;
					x++;
				}
			}

			if (x >= width || ch == '\n') {
				lines.push(cline);
				cline = '';
				y++;

				if (y >= height) return lines;
				x = 0;
			}
		}

		if (cline) lines.push(cline);
		return lines;
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
