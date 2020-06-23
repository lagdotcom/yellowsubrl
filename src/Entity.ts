export default class Entity {
	x: number;
	y: number;
	char: string;
	colour: string;
	name: string;
	blocks: boolean;

	constructor(
		x: number,
		y: number,
		char: string,
		colour: string,
		name: string,
		blocks: boolean = false
	) {
		this.x = x;
		this.y = y;
		this.char = char;
		this.colour = colour;
		this.name = name;
		this.blocks = blocks;
	}

	move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}
}

export function getBlockingEntitiesAtLocation(
	entities: Entity[],
	x: number,
	y: number
) {
	return entities.find(e => e.blocks && e.x == x && e.y == y);
}
