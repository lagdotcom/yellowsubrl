import { Tileset } from '../libtcod/Tileset';

export default class Location {
	constructor(public x: number, public y: number, public blocks: boolean) {}

	move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}
}
