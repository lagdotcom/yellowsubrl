import XY from './XY';

type Direction = 'u' | 'r' | 'd' | 'l';
export default Direction;

export function getOffset(d: Direction): XY {
	switch (d) {
		case 'd':
			return { x: 0, y: 1 };
		case 'l':
			return { x: -1, y: 0 };
		case 'r':
			return { x: 1, y: 0 };
		case 'u':
			return { x: 0, y: -1 };
	}
}

export const adjacentOffsets = [
	getOffset('u'),
	getOffset('r'),
	getOffset('d'),
	getOffset('l'),
];
