export default class Entity {
	x: number;
	y: number;
	char: string;
	colour: string;

	constructor(x: number, y: number, char: string, colour: string) {
		this.x = x;
		this.y = y;
		this.char = char;
		this.colour = colour;
	}

	move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}
}
