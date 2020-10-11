import sum from 'lodash.sum';

export default interface XY {
	x: number;
	y: number;
}

export type XYTag = string;

export function XYtoTag(p: XY): XYTag {
	return `${p.x},${p.y}`;
}

export function TagtoXY(tag: XYTag): XY {
	const [x, y] = tag.split(',').map(o => parseInt(o));
	return { x, y };
}

export function pointSum(...points: XY[]): XY {
	return { x: sum(points.map(p => p.x)), y: sum(points.map(p => p.y)) };
}

export function atSamePosition(a: XY, b: XY) {
	return a.x === b.x && a.y === b.y;
}
