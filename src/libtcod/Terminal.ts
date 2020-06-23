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

	constructor(w: number, h: number) {
		this.width = w;
		this.height = h;

		const canvas = document.createElement('canvas');
		this.element = canvas;
		canvas.width = w;
		canvas.height = h;
		document.body.appendChild(canvas);
		sys.addEventSource(canvas);

		const context = canvas.getContext('2d');
		if (!context) throw 'Could not get 2D context';
		this.context = context;
		context.fillStyle = Colours.black;
		context.fillRect(0, 0, canvas.width, canvas.height);

		this.tick = this.tick.bind(this);
		this.running = true;
		this.handle = 0;
		this.schedule();
	}

	present(
		con: Console,
		options: {
			keepAspect: boolean;
			integerScaling: boolean;
			clearColour: string;
			align: [number, number];
		} = {
			keepAspect: false,
			integerScaling: false,
			clearColour: '#000000',
			align: [0.5, 0.5],
		}
	) {
		// TODO: keepAspect, integerScaling, align

		this.context.fillStyle = options.clearColour;
		this.context.fillRect(0, 0, this.width, this.height);

		this.context.drawImage(con.render(), 0, 0);
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
