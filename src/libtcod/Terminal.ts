import { Tileset } from './Tileset';
import { Console } from './Console';
import { sys, Colours } from '../tcod';

export class Terminal {
	callback?: FrameRequestCallback;
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

		const canvas = document.createElement('canvas');
		this.element = canvas;
		canvas.width = w * tileset.tileWidth;
		canvas.height = h * tileset.tileHeight;
		document.body.appendChild(canvas);
		sys.addEventSource(canvas);

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.imageSmoothingEnabled = false;
		context.fillStyle = Colours.black;
		context.fillRect(0, 0, canvas.width, canvas.height);

		this.tick = this.tick.bind(this);
		this.running = true;
		this.handle = 0;
		this.schedule();
	}

	present(con: Console) {
		const { tileWidth, tileHeight } = this.tileset;

		con.bgUpdates.forEach(u => {
			this.context.globalCompositeOperation = u.mode;
			this.context.fillStyle = u.colour;
			this.context.fillRect(
				u.x * tileWidth,
				u.y * tileHeight,
				tileWidth,
				tileHeight
			);
		});
		con.bgUpdates = [];

		con.fgUpdates.forEach(u => {
			const img = this.tileset.getChar(u.ch, u.colour);
			if (!img) return;

			this.context.globalCompositeOperation = u.mode;
			this.context.drawImage(img, u.x * tileWidth, u.y * tileHeight);
		});
		con.fgUpdates = [];
	}

	main(f: FrameRequestCallback) {
		this.callback = f;
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.handle);
	}

	private schedule() {
		if (this.running) this.handle = requestAnimationFrame(this.tick);
	}

	private tick(time: number) {
		this.callback && this.callback(time);
		this.schedule();
	}
}
