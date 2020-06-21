export default class Tile {
	blocked: boolean;
	block_sight: boolean;

	constructor(blocked: boolean, block_sight?: boolean) {
		this.blocked = blocked;
		this.block_sight =
			typeof block_sight === 'undefined' ? blocked : block_sight;
	}
}
