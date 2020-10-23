import RedBlobVis from './fov/RedBlobVis';
import { refreshVisibility as nystrom } from './fov/NystromShadows';

export enum FovAlgorithm {
	Raycasting,
	Raycasting2,
	Sunburst,
	RedBlob,
	NystromShadows,
}

function raycasting(
	map: TileMap,
	cx: number,
	cy: number,
	radius: number,
	lightWalls: boolean
) {
	const minX = Math.max(0, cx - radius);
	const maxX = Math.min(map.width - 1, cx + radius);
	const minY = Math.max(0, cy - radius);
	const maxY = Math.min(map.height - 1, cy + radius);
	const rad2 = radius * radius;

	function ray(x1: number, y1: number) {
		var x0 = cx,
			y0 = cy;
		const dx = Math.abs(x1 - x0);
		const sx = x0 < x1 ? 1 : -1;
		const dy = -Math.abs(y1 - y0);
		const sy = y0 < y1 ? 1 : -1;
		var err = dx + dy;
		while (true) {
			const distX = Math.abs(x0 - cx);
			const distY = Math.abs(y0 - cy);
			if (distX * distX + distY * distY > rad2) return;

			if (!map.contains(x0, y0)) return;
			const t = map.tiles[x0][y0];
			t.inFov = lightWalls || t.allowSight;
			if (!t.allowSight) return;

			if (x0 == x1 && y0 == y1) return;

			const e2 = 2 * err;
			if (e2 >= dy) {
				err += dy;
				x0 += sx;
			}
			if (e2 <= dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	for (var x = minX; x <= maxX; x++) {
		ray(x, minY);
		ray(x, maxY);
	}
	for (var y = minY; y <= maxY; y++) {
		ray(minX, y);
		ray(maxX, y);
	}
}

const sunRays = 90;
function raycasting2(
	map: TileMap,
	cx: number,
	cy: number,
	radius: number,
	lightWalls: boolean
) {
	function ray(x1: number, y1: number) {
		var x0 = cx,
			y0 = cy;
		const dx = Math.abs(x1 - x0);
		const sx = x0 < x1 ? 1 : -1;
		const dy = -Math.abs(y1 - y0);
		const sy = y0 < y1 ? 1 : -1;
		var err = dx + dy;
		while (true) {
			if (!map.contains(x0, y0)) return;
			const t = map.tiles[x0][y0];
			t.inFov = lightWalls || t.allowSight;
			if (!t.allowSight) return;

			if (x0 == x1 && y0 == y1) return;

			const e2 = 2 * err;
			if (e2 >= dy) {
				err += dy;
				x0 += sx;
			}
			if (e2 <= dx) {
				err += dx;
				y0 += sy;
			}
		}
	}

	const targets = new Set<string>();
	var a = 0;
	const aadd = (Math.PI * 2) / sunRays;
	for (var a = 0; a < Math.PI * 2; a += aadd) {
		const x = Math.round(cx + Math.cos(a) * radius);
		const y = Math.round(cy + Math.sin(a) * radius);
		const key = `${x},${y}`;

		if (!targets.has(key)) {
			targets.add(key);
			ray(x, y);
		}
	}
}

function sunburst(
	map: TileMap,
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

	const increment = (Math.PI * 2) / sunRays;
	for (var a = 0; a < Math.PI * 2; a += increment) ray(a);
}

const algorithms = {
	[FovAlgorithm.Raycasting]: raycasting,
	[FovAlgorithm.Raycasting2]: raycasting2,
	[FovAlgorithm.Sunburst]: sunburst,
	[FovAlgorithm.RedBlob]: (
		map: TileMap,
		x: number,
		y: number,
		radius: number,
		lightWalls: boolean
	) => {
		const vis = new RedBlobVis(
			(x, y) => (map.contains(x, y) ? !map.tiles[x][y].allowSight : true),
			(x, y) => {
				const t = map.tiles[x][y];
				t.inFov = lightWalls || t.allowSight;
			},
			(x, y) => x * x + y * y
		);

		vis.compute({ x, y }, radius * radius);
	},
	[FovAlgorithm.NystromShadows]: nystrom,
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

export default class TileMap {
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
		return this.contains(x, y) && this.tiles[x][y].inFov;
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
