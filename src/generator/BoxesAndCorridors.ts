import RNG from '../RNG';
import Entity from '../Entity';
import { Rect } from '../mapObjects';
import { Colours } from '../tcod';
import GameMap from '../GameMap';

export default class BoxesAndCorridors {
	maxRooms: number;
	roomMinSize: number;
	roomMaxSize: number;
	mapWidth: number;
	mapHeight: number;
	maxMonstersPerRoom: number;

	constructor(
		maxRooms: number,
		roomMinSize: number,
		roomMaxSize: number,
		mapWidth: number,
		mapHeight: number,
		maxMonstersPerRoom: number
	) {
		this.maxRooms = maxRooms;
		this.roomMaxSize = roomMaxSize;
		this.roomMinSize = roomMinSize;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.maxMonstersPerRoom = maxMonstersPerRoom;
	}

	generate(rng: RNG, gameMap: GameMap, player: Entity, entities: Entity[]) {
		const rooms: Rect[] = [];

		for (var r = 0; r < this.maxRooms; r++) {
			const w = rng.randint(this.roomMinSize, this.roomMaxSize);
			const h = rng.randint(this.roomMinSize, this.roomMaxSize);
			const x = rng.randint(0, this.mapWidth - w - 1);
			const y = rng.randint(0, this.mapHeight - h - 1);

			const newRoom = new Rect(x, y, w, h);
			var ok = true;
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].intersect(newRoom)) {
					ok = false;
					break;
				}
			}

			if (ok) {
				gameMap.createRoom(newRoom);
				const [newX, newY] = newRoom.centre();

				if (!rooms.length) {
					player.x = newX;
					player.y = newY;
				} else {
					const [prevX, prevY] = rooms[rooms.length - 1].centre();

					if (rng.flip()) {
						gameMap.createHTunnel(prevX, newX, prevY);
						gameMap.createVTunnel(prevY, newY, newX);
					} else {
						gameMap.createVTunnel(prevY, newY, prevX);
						gameMap.createHTunnel(prevX, newX, newY);
					}
				}

				this.placeEntities(rng, newRoom, entities);
				rooms.push(newRoom);
			}
		}
	}

	placeEntities(rng: RNG, room: Rect, entities: Entity[]) {
		const numberOfMonsters = rng.randint(0, this.maxMonstersPerRoom);

		for (var i = 0; i < numberOfMonsters; i++) {
			const x = rng.randint(room.x1 + 1, room.x2 - 1);
			const y = rng.randint(room.y1 + 1, room.y2 - 1);

			if (!entities.find(e => e.x == x && e.y == y)) {
				const type = rng.weighted([
					[8, { name: 'Orc', colour: Colours.green, char: 'o' }],
					[2, { name: 'Troll', colour: Colours.darkGreen, char: 'T' }],
				]);

				const monster = new Entity(
					x,
					y,
					type.char,
					type.colour,
					type.name,
					true
				);
				entities.push(monster);
			}
		}
	}
}
