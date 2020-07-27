import RNG from '../RNG';
import { Rect } from '../mapObjects';
import GameMap from '../GameMap';
import ecs from '../ecs';
import { stairsPrefab } from '../features/stairs';
import { Stairs, Position } from '../components';

export default class BoxesAndCorridors {
	maxRooms: number;
	roomMinSize: number;
	roomMaxSize: number;
	mapWidth: number;
	mapHeight: number;
	maxMonstersPerRoom: number;
	maxItemsPerRoom: number;

	constructor({
		maxRooms,
		roomMinSize,
		roomMaxSize,
		mapWidth,
		mapHeight,
		maxMonstersPerRoom,
		maxItemsPerRoom,
	}: {
		maxRooms: number;
		roomMinSize: number;
		roomMaxSize: number;
		mapWidth: number;
		mapHeight: number;
		maxMonstersPerRoom: number;
		maxItemsPerRoom: number;
	}) {
		this.maxRooms = maxRooms;
		this.roomMaxSize = roomMaxSize;
		this.roomMinSize = roomMinSize;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.maxMonstersPerRoom = maxMonstersPerRoom;
		this.maxItemsPerRoom = maxItemsPerRoom;
	}

	generate(rng: RNG, gameMap: GameMap) {
		const rooms: Rect[] = [];
		const position = { x: 0, y: 0 };
		var last = [0, 0];

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
				last = [newX, newY];

				if (!rooms.length) {
					position.x = newX;
					position.y = newY;
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

				gameMap.placeEntities(
					rng,
					newRoom,
					this.maxMonstersPerRoom,
					this.maxItemsPerRoom
				);
				rooms.push(newRoom);
			}
		}

		ecs
			.entity(stairsPrefab)
			.add(Stairs, { floor: gameMap.floor + 1 })
			.add(Position, { x: last[0], y: last[1] });

		return position;
	}
}
