export type SysEventType =
	| 'FingerMove'
	| 'FingerPress'
	| 'FingerRelease'
	| 'KeyDown'
	| 'KeyPress'
	| 'KeyRelease'
	| 'MouseMove'
	| 'MousePress'
	| 'MouseRelease';
export const FingerMove = 'FingerMove',
	FingerPress = 'FingerPress',
	FingerRelease = 'FingerRelease',
	KeyDown = 'KeyDown',
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
export const KeyEvents: SysEventType[] = [KeyDown, KeyPress];
export const MouseEvents: SysEventType[] = [
	MouseMove,
	MousePress,
	MouseRelease,
];

export interface SysKeyEvent {
	type: 'KeyDown' | 'KeyPress' | 'KeyRelease';
	key: string;
	keyCode: number;
	alt: boolean;
	shift: boolean;
	ctrl: boolean;
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

export interface SysEvents {
	key?: SysKeyEvent;
	mouse?: SysMouseEvent;
	finger?: SysFingerEvent;
}

export interface GeneratesEvents {
	addEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
}

export class Sys {
	key: SysKeyEvent[];
	mouse: SysMouseEvent[];
	finger: SysFingerEvent[];

	constructor() {
		this.key = [];
		this.mouse = [];
		this.finger = [];

		this.addEventSource(window);
	}

	addEventSource(el: GeneratesEvents) {
		el.addEventListener('keydown', e => {
			this.key.push({
				type: KeyDown,
				key: e.key,
				keyCode: e.keyCode,
				alt: e.altKey,
				shift: e.shiftKey,
				ctrl: e.ctrlKey,
			});
		});

		el.addEventListener('keypress', e => {
			this.key.push({
				type: KeyPress,
				key: e.key,
				keyCode: e.keyCode,
				alt: e.altKey,
				shift: e.shiftKey,
				ctrl: e.ctrlKey,
			});
		});

		el.addEventListener('keyup', e => {
			this.key.push({
				type: KeyRelease,
				key: e.key,
				keyCode: e.keyCode,
				alt: e.altKey,
				shift: e.shiftKey,
				ctrl: e.ctrlKey,
			});
		});
	}

	checkForEvents(type: SysEventType | SysEventType[]) {
		const events: SysEvents = {};
		const types = typeof type === 'string' ? [type] : type;

		if (types.includes(KeyPress) || types.includes(KeyRelease)) {
			events.key = this.key.shift();
		}

		if (
			types.includes(MouseMove) ||
			types.includes(MousePress) ||
			types.includes(MouseRelease)
		) {
			events.mouse = this.mouse.shift();
		}

		if (
			types.includes(FingerMove) ||
			types.includes(FingerPress) ||
			types.includes(FingerRelease)
		) {
			events.finger = this.finger.shift();
		}

		return events;
	}
}
