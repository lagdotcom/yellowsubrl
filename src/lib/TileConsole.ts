import Colours from '../Colours';
import Tileset from './Tileset';

export const EmbedTile = '\x02';
export const EmbedFG = '\x03';
export const EmbedBG = '\x04';
export const EmbedEnd = '\x0f';

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

interface TileInstruction {
	type: 'tile';
	tile: string;
}
interface FGInstruction {
	type: 'fg';
	fg: string;
}
interface BGInstruction {
	type: 'bg';
	bg: string;
}
type Instruction = TileInstruction | FGInstruction | BGInstruction;

export default class TileConsole {
	cols: number;
	context: CanvasRenderingContext2D;
	defaultBg: string;
	defaultBgBlend: BlendMode;
	defaultFg: string;
	element: HTMLCanvasElement;
	rows: number;
	tiles: ConsoleTile[][];
	tileset: Tileset;
	tilesFlat: ConsoleTile[];

	constructor(cols: number, rows: number, tileset: Tileset) {
		this.cols = cols;
		this.rows = rows;
		this.tileset = tileset;
		this.defaultBg = Colours.black;
		this.defaultBgBlend = BlendMode.Set;
		this.defaultFg = Colours.white;

		this.tiles = [];
		for (var x = 0; x < cols; x++) {
			const col: ConsoleTile[] = [];
			for (var y = 0; y < rows; y++)
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
		canvas.width = cols * tileset.tileWidth;
		canvas.height = rows * tileset.tileHeight;

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.fillStyle = this.defaultBg;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	contains(x: number, y: number) {
		return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
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
		this.element.width = this.cols * tileset.tileWidth;
		this.element.height = this.rows * tileset.tileHeight;

		this.tilesFlat.forEach(t => {
			this.drawTile(t);
		});
	}

	putChar(x: number, y: number, c: number | string, overrideFg?: string) {
		if (!this.contains(x, y)) return;

		const ch = typeof c === 'number' ? String.fromCharCode(c) : c;
		const fg = overrideFg || this.defaultFg;
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

	printBorder(
		sx: number,
		sy: number,
		width: number,
		height: number,
		fg?: string
	) {
		const ex = width - sx;
		const ey = height - sy;

		for (var x = sx + 1; x < ex; x++) {
			this.putChar(x, sy, 'BorderT', fg);
			this.putChar(x, ey, 'BorderB', fg);
		}

		for (var y = sy + 1; y < ey; y++) {
			this.putChar(sx, y, 'BorderL', fg);
			this.putChar(ex, y, 'BorderR', fg);
		}

		this.putChar(sx, sy, 'BorderTL', fg);
		this.putChar(ex, sy, 'BorderTR', fg);
		this.putChar(sx, ey, 'BorderBL', fg);
		this.putChar(ex, ey, 'BorderBR', fg);
	}

	printBox(
		x: number,
		y: number,
		width: number,
		height: number,
		str: string,
		startFg: string = '',
		startBg: string = '',
		bgBlend: BlendMode = BlendMode.Set,
		alignment: PrintAlign = PrintAlign.Left
	) {
		var fg = startFg;
		var bg = startBg;
		if (fg) this.setDefaultForeground(fg);

		const lines = this.parseWrap(width, height, str);
		lines.forEach((line, ly) => {
			var lx = 0;

			if (alignment == PrintAlign.Right) lx = width - line.length;
			else if (alignment == PrintAlign.Center)
				lx = Math.floor((width - line.length) / 2);

			for (var i = 0; i < line.length; i++) {
				const item = line[i];

				switch (item.type) {
					case 'tile':
						if (bg) this.setCharBackground(x + lx, y + ly, bg, bgBlend);
						if (fg) this.putChar(x + lx, y + ly, item.tile, fg);
						lx++;
						break;

					case 'fg':
						fg = item.fg === 'reset' ? startFg : item.fg;
						break;

					case 'bg':
						bg = item.bg === 'reset' ? startBg : item.bg;
						break;
				}
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
		if (!this.contains(x, y)) return;
		const tile = this.tiles[x][y];

		if (tile.fg != fg || tile.ch != ch) {
			tile.fg = fg;
			tile.ch = ch;
			tile.dirty = true;
		}
	}

	setCharBackground(x: number, y: number, bg: string, mode: BlendMode) {
		if (!this.contains(x, y)) return;
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
		dest: TileConsole,
		dx: number,
		dy: number,
		sx: number = 0,
		sy: number = 0,
		width: number = 0,
		height: number = 0
	) {
		width = width || this.cols;
		height = height || this.rows;

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

	private parseWrap(width: number, height: number, str: string) {
		const lines = [];
		var cline: Instruction[] = [];
		var x = 0;
		var y = 0;

		for (var i = 0; i < str.length; i++) {
			const ch = str[i];

			if (ch === EmbedTile) {
				const [tile, nexti] = this.parseScan(str, i);
				if (tile) {
					i = nexti;
					x += 2;
					cline.push({ type: 'tile', tile });
					continue;
				}
			}

			if (ch == EmbedFG) {
				const [fg, nexti] = this.parseScan(str, i);
				if (fg) {
					i = nexti;
					cline.push({ type: 'fg', fg });
					continue;
				}
			}

			if (ch == EmbedBG) {
				const [bg, nexti] = this.parseScan(str, i);
				if (bg) {
					i = nexti;
					cline.push({ type: 'bg', bg });
					continue;
				}
			}

			if (ch != '\n') {
				if (ch != ' ' || x) {
					cline.push({ type: 'tile', tile: ch });
					x++;
				}
			}

			if (x >= width || ch == '\n') {
				lines.push(cline);
				cline = [];
				y++;

				if (y >= height) return lines;
				x = 0;
			}
		}

		if (cline) lines.push(cline);
		return lines;
	}

	private parseScan(str: string, i: number): [found: string, nexti: number] {
		const j = str.indexOf(EmbedEnd, i);
		return j >= 0 ? [str.slice(i + 1, j), j] : ['', i];
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
