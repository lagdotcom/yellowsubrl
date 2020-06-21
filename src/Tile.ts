export default class Tile {
	blocked: boolean;
	blockSight: boolean;

	constructor(blocked: boolean, blockSight?: boolean) {
		this.blocked = blocked;
		this.blockSight = typeof blockSight === 'undefined' ? blocked : blockSight;
	}
}
