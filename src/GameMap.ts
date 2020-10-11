import Tile from './Tile';
import { Rect } from './mapObjects';
import RNG, { RNGSeed } from './RNG';
import ecs from './ecs';
import { getBlocker, isAt } from './systems/entities';
import { Position } from './components';
import { getItemSpawnChances, getEnemySpawnChances, fscale } from './spawnData';
import XY, { XYTag, XYtoTag } from './XY';
import { adjacentOffsets } from './Direction';

export default class GameMap {
	floor!: number;
	width!: number;
	height!: number;
	seed!: RNGSeed;
	tiles!: Tile[][];

	constructor(seed: RNGSeed, width: number, height: number, floor: number) {
		this.reset(seed, width, height, floor);
	}

	reset(seed: RNGSeed, width: number, height: number, floor: number) {
		this.seed = seed;
		this.width = width;
		this.height = height;
		this.floor = floor;

		this.tiles = this.initializeTiles();
	}

	debug() {
		var s = '';
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				if (this.tiles[x][y].blocked) s += '#';
				else s += ' ';
			}

			s += '\n';
		}

		console.log(s);
	}

	contains(x: number, y: number) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	isBlocked(x: number, y: number) {
		if (this.tiles[x][y].blocked) return true;

		return false;
	}

	createRoom(room: Rect) {
		for (var x = room.x1 + 1; x < room.x2; x++) {
			for (var y = room.y1 + 1; y < room.y2; y++) {
				this.tiles[x][y].blocked = false;
				this.tiles[x][y].blockSight = false;
			}
		}
	}

	createHTunnel(x1: number, x2: number, y: number) {
		for (var x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
			this.tiles[x][y].blocked = false;
			this.tiles[x][y].blockSight = false;
		}
	}

	createVTunnel(y1: number, y2: number, x: number) {
		for (var y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
			this.tiles[x][y].blocked = false;
			this.tiles[x][y].blockSight = false;
		}
	}

	addBorder() {
		const { width, height } = this;

		for (var x = 0; x < width; x++) {
			this.tiles[x][0].blocked = true;
			this.tiles[x][0].blockSight = true;
			this.tiles[x][height - 1].blocked = true;
			this.tiles[x][height - 1].blockSight = true;
		}

		for (var y = 0; y < height; y++) {
			this.tiles[0][y].blocked = true;
			this.tiles[0][y].blockSight = true;
			this.tiles[width - 1][y].blocked = true;
			this.tiles[width - 1][y].blockSight = true;
		}
	}

	fill(
		sx: number,
		sy: number,
		w: number,
		h: number,
		blocked: boolean,
		blockSight: boolean = blocked
	) {
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				this.tiles[sx + x][sy + y].blocked = blocked;
				this.tiles[sx + x][sy + y].blockSight = blockSight;
			}
		}
	}

	flood(sx: number, sy: number, blocked: boolean) {
		const area = new Set<XYTag>();
		const checked = new Set<XYTag>();
		const check: XY[] = [{ x: sx, y: sy }];

		while (check.length) {
			const xy = check.pop()!;
			if (this.tiles[xy.x][xy.y].blocked === blocked) {
				area.add(XYtoTag(xy));

				adjacentOffsets.forEach(j => {
					const neighbour = { x: xy.x + j.x, y: xy.y + j.y };
					const tag = XYtoTag(neighbour);
					if (this.contains(neighbour.x, neighbour.y) && !checked.has(tag)) {
						check.push(neighbour);
						checked.add(tag);
					}
				});
			}
		}

		return area;
	}

	placeEntities(rng: RNG, room: Rect) {
		const numberOfMonsters = rng.randint(
			0,
			fscale(this.floor, [2, 1], [3, 4], [5, 6])
		);
		const numberOfItems = rng.randint(0, fscale(this.floor, [1, 1], [2, 4]));

		for (var i = 0; i < numberOfMonsters; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (!getBlocker(x, y)) {
				const prefab = rng.weighted(getEnemySpawnChances(this.floor));
			}
		}

		for (var i = 0; i < numberOfItems; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (
				ecs.find({ all: [Position] }).filter(en => isAt(en, x, y)).length == 0
			) {
				const prefab = rng.weighted(getItemSpawnChances(this.floor));
			}
		}
	}

	getExplored() {
		return this.tiles
			.flat()
			.filter(tile => tile.explored)
			.map(tile => tile.tag);
	}

	reveal(tags: string[]) {
		this.tiles
			.flat()
			.filter(tile => tags.includes(tile.tag))
			.forEach(tile => (tile.explored = true));
	}

	private initializeTiles() {
		const tiles: Tile[][] = [];

		for (var x = 0; x < this.width; x++) {
			const col: Tile[] = [];

			for (var y = 0; y < this.height; y++) col.push(new Tile(x, y, true));

			tiles.push(col);
		}

		return tiles;
	}
}
