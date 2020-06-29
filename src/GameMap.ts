import Tile from './Tile';
import { Rect } from './mapObjects';
import Entity, { getBlockingEntitiesAtLocation } from './Entity';
import RNG, { RNGSeed } from './RNG';
import { Colours } from './tcod';
import Appearance from './components/Appearance';
import Location from './components/Location';
import BasicAI from './components/BasicAI';
import Fighter from './components/Fighter';
import { RenderOrder } from './renderFunctions';
import Item from './components/Item';
import { heal, castLightning } from './itemFunctions';
import { itemSpawnData, enemySpawnData } from './spawnData';
import Weapon from './components/Weapon';

export interface MapGenerator {
	generate(
		rng: RNG,
		gameMap: GameMap,
		player: Entity,
		entities: Entity[]
	): void;
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

	inBounds(x: number, y: number) {
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
		entities: Entity[],
		maxMonstersPerRoom: number,
		maxItemsPerRoom: number
	) {
		const numberOfMonsters = rng.randint(0, maxMonstersPerRoom);
		const numberOfItems = rng.randint(0, maxItemsPerRoom);

		for (var i = 0; i < numberOfMonsters; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (!getBlockingEntitiesAtLocation(entities, x, y)) {
				const type = rng.weighted(enemySpawnData);

				const monster = new Entity({
					name: type.name,
					ai: new BasicAI(),
					appearance: new Appearance(type.char, type.colour, RenderOrder.Actor),
					fighter: new Fighter(type.hp, type.defense, type.power),
					location: new Location(x, y, true),
				});
				entities.push(monster);
			}
		}

		for (var i = 0; i < numberOfItems; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (
				!entities.find(e => e.location && e.location.x == x && e.location.y)
			) {
				const type = rng.weighted(itemSpawnData);

				const item = new Entity({
					name: type.name,
					appearance: new Appearance(type.char, type.colour, RenderOrder.Item),
					item: new Item(type.use, type.targeting, type.targetingMessage),
					location: new Location(x, y, false),
					weapon: type.weapon ? new Weapon(type.weapon) : undefined,
				});
				entities.push(item);
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
