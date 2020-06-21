export class Rect {
	x1: number;
	y1: number;
	x2: number;
	y2: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.x1 = x;
		this.y1 = y;
		this.x2 = x + w;
		this.y2 = y + h;
	}

	centre(): [number, number] {
		const cx = Math.floor((this.x1 + this.x2) / 2);
		const cy = Math.floor((this.y1 + this.y2) / 2);

		return [cx, cy];
	}

	intersect(other: Rect) {
		return (
			this.x1 <= other.x2 &&
			this.x2 >= other.x1 &&
			this.y1 <= other.y2 &&
			this.y2 >= other.y1
		);
	}
}
