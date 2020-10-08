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
