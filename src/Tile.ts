import { XYTag, XYtoTag } from './XY';

export default class Tile {
	tag: XYTag;
	blocked: boolean;
	blockSight: boolean;
	explored: boolean;

	constructor(x: number, y: number, blocked: boolean, blockSight?: boolean) {
		this.tag = XYtoTag({ x, y });
		this.blocked = blocked;
		this.blockSight = typeof blockSight === 'undefined' ? blocked : blockSight;
		this.explored = false;
	}
}
