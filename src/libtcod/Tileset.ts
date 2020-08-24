const tcodLayout = [
	` !"#$%&'()*+,-./0123456789:;<=>?`,
	'@[\\]^_`{|}~░▒▓│─┼┤┴├┬└┌┐┘▘▝▀▗▚▐▖',
	'⭡⭣⭠⭢⯅⯆⯇⯈⭥⭤☐☑⭘⭗║═╬╣╩╠╦╚╔╗╝',
	'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	'abcdefghijklmnopqrstuvwxyz',
	'',
	'',
	'',
];

export type Charmap = { [ch: string]: [x: number, y: number] };

function convertLayout(layout: readonly string[]) {
	const charmap: Charmap = {};

	// process the lookup table
	for (var row = 0; row < layout.length; row++) {
		for (var col = 0; col < layout[row].length; col++) {
			charmap[layout[row][col]] = [col, row];
		}
	}

	return charmap;
}

function expandCharmap(charmap: Charmap, w: number, h: number) {
	const expanded: Charmap = {};

	for (const key in charmap) {
		const [x, y] = charmap[key];
		expanded[key] = [x * w, y * h];
	}

	return expanded;
}

export const Charmaps = {
	TCOD: convertLayout(tcodLayout),
};

export class Tileset {
	canvas: HTMLCanvasElement;
	charmap: Charmap;
	context: CanvasRenderingContext2D;
	src: CanvasImageSource;
	tileHeight: number;
	tileWidth: number;

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
		// get the tile size
		const { width, height } = src;
		this.tileWidth = width / rows;
		this.tileHeight = height / cols;

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

		this.charmap = expandCharmap(charmap, this.tileWidth, this.tileHeight);

		// reserve a canvas for text drawing
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.tileWidth;
		this.canvas.height = this.tileHeight;

		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw 'Could not reserve canvas for text drawing';
		this.context = ctx;
	}

	getChar(ch: string, fg: string) {
		const loc = this.charmap[ch];
		if (!loc) return undefined;

		const { canvas, context, src, tileWidth, tileHeight } = this;

		context.globalCompositeOperation = 'copy';
		context.fillStyle = fg;
		context.fillRect(0, 0, tileWidth, tileHeight);

		context.globalCompositeOperation = 'destination-in';
		context.drawImage(
			src,
			loc[0],
			loc[1],
			tileWidth,
			tileHeight,
			0,
			0,
			tileWidth,
			tileHeight
		);

		return canvas;
	}
}
