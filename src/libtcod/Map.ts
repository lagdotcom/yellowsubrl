export enum FovAlgorithm {
	Raycasting = 0,
}

const raycastRays = 360;
function raycast(
	map: Map,
	cx: number,
	cy: number,
	radius: number,
	lightWalls: boolean
) {
	const ray = (a: number) => {
		const dx = Math.cos(a);
		const dy = Math.sin(a);
		var x = cx + 0.5;
		var y = cy + 0.5;

		for (var i = 0; i < radius; i++) {
			const tx = Math.floor(x);
			const ty = Math.floor(y);

			if (!map.contains(tx, ty)) return;
			const t = map.tiles[tx][ty];
			t.inFov = lightWalls || t.allowSight;
			if (!t.allowSight) return;

			x += dx;
			y += dy;
		}
	};

	const increment = (Math.PI * 2) / raycastRays;
	for (var a = 0; a < Math.PI * 2; a += increment) ray(a);
}

const algorithms = {
	[FovAlgorithm.Raycasting]: raycast,
};

class MapTile {
	allowMove: boolean;
	allowSight: boolean;
	inFov: boolean;

	constructor() {
		this.allowMove = false;
		this.allowSight = false;
		this.inFov = false;
	}
}

export class Map {
	width: number;
	height: number;
	tiles: MapTile[][];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;

		this.tiles = [];
		for (var x = 0; x < width; x++) {
			const col: MapTile[] = [];
			for (var y = 0; y < height; y++) col.push(new MapTile());
			this.tiles.push(col);
		}
	}

	contains(x: number, y: number) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	setProperties(x: number, y: number, allowSight: boolean, allowMove: boolean) {
		this.tiles[x][y].allowMove = allowMove;
		this.tiles[x][y].allowSight = allowSight;
	}

	isInFov(x: number, y: number) {
		return this.tiles[x][y].inFov;
	}

	computeFov(
		cx: number,
		cy: number,
		radius: number,
		lightWalls: boolean,
		algorithm: FovAlgorithm
	) {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.tiles[x][y].inFov = false;
			}
		}

		algorithms[algorithm](this, cx, cy, radius, lightWalls);
	}
}
