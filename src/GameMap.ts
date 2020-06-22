import Tile from './Tile';
import { Rect } from './mapObjects';
import Entity from './Entity';
import RNG, { RNGSeed } from './RNG';

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

	isBlocked(x: number, y: number) {
		if (this.tiles[x][y].blocked) return true;

		return false;
	}

	makeMap(
		rng: RNG,
		maxRooms: number,
		roomMinSize: number,
		roomMaxSize: number,
		mapWidth: number,
		mapHeight: number,
		player: Entity
	) {
		rng.seed = this.seed;
		const rooms: Rect[] = [];

		for (var r = 0; r < maxRooms; r++) {
			const w = rng.randint(roomMinSize, roomMaxSize);
			const h = rng.randint(roomMinSize, roomMaxSize);
			const x = rng.randint(0, mapWidth - w - 1);
			const y = rng.randint(0, mapHeight - h - 1);

			const newRoom = new Rect(x, y, w, h);
			var ok = true;
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].intersect(newRoom)) {
					ok = false;
					break;
				}
			}

			if (ok) {
				this.createRoom(newRoom);
				const [newX, newY] = newRoom.centre();

				if (!rooms.length) {
					player.x = newX;
					player.y = newY;
				} else {
					const [prevX, prevY] = rooms[rooms.length - 1].centre();

					if (rng.randint(0, 1) == 1) {
						this.createHTunnel(prevX, newX, prevY);
						this.createVTunnel(prevY, newY, newX);
					} else {
						this.createVTunnel(prevY, newY, prevX);
						this.createHTunnel(prevX, newX, newY);
					}
				}

				rooms.push(newRoom);
			}
		}
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
