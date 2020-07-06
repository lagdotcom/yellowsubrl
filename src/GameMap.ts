import Tile from './Tile';
import { Rect } from './mapObjects';
import RNG, { RNGSeed } from './RNG';
import { RenderOrder } from './renderFunctions';
import { itemSpawnData, enemySpawnData } from './spawnData';
import ecs, {
	Appearance,
	Blocks,
	Fighter,
	Item,
	Position,
	Weapon,
	AI,
} from './ecs';
import { getBlocker, isAt } from './systems/entities';
import { XY } from './systems/movement';

export interface MapGenerator {
	generate(rng: RNG, gameMap: GameMap): XY;
}

export default class GameMap {
	width!: number;
	height!: number;
	seed!: RNGSeed;
	tiles!: Tile[][];

	constructor(seed: RNGSeed, width: number, height: number) {
		this.reset(seed, width, height);
	}

	reset(seed: RNGSeed, width: number, height: number) {
		this.seed = seed;
		this.width = width;
		this.height = height;

		this.tiles = this.initializeTiles();
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

	placeEntities(
		rng: RNG,
		room: Rect,
		maxMonstersPerRoom: number,
		maxItemsPerRoom: number
	) {
		const numberOfMonsters = rng.randint(0, maxMonstersPerRoom);
		const numberOfItems = rng.randint(0, maxItemsPerRoom);

		for (var i = 0; i < numberOfMonsters; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (!getBlocker(x, y)) {
				const prefab = rng.weighted(enemySpawnData);
				const enemy = ecs.entity(prefab).add(Position, { x, y });
			}
		}

		for (var i = 0; i < numberOfItems; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (
				ecs.find({ all: [Position] }).filter(en => isAt(en, x, y)).length == 0
			) {
				const prefab = rng.weighted(itemSpawnData);
				const item = ecs.entity(prefab).add(Position, { x, y });
			}
		}
	}

	private initializeTiles() {
		const tiles: Tile[][] = [];

		for (var x = 0; x < this.width; x++) {
			const col: Tile[] = [];

			for (var y = 0; y < this.height; y++) col.push(new Tile(true));

			tiles.push(col);
		}

		return tiles;
	}
}
