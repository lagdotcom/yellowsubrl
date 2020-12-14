import RNG from '../RNG';
import Rect from '../Rect';
import GameMap from '../GameMap';
import ecs from '../ecs';
import { Stairs, Position } from '../components';
import MapGenerator from '../MapGenerator';
import Realm from '../Realm';

export default class BoxesAndCorridors implements MapGenerator {
	maxRooms: number;
	roomMinSize: number;
	roomMaxSize: number;
	mapWidth: number;
	mapHeight: number;

	constructor({
		maxRooms,
		roomMinSize,
		roomMaxSize,
		mapWidth,
		mapHeight,
	}: {
		maxRooms: number;
		roomMinSize: number;
		roomMaxSize: number;
		mapWidth: number;
		mapHeight: number;
	}) {
		this.maxRooms = maxRooms;
		this.roomMaxSize = roomMaxSize;
		this.roomMinSize = roomMinSize;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
	}

	generate(realm: Realm, rng: RNG, gameMap: GameMap) {
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

				gameMap.placeEntities(realm, rng, newRoom);
				rooms.push(newRoom);
			}
		}

		ecs
			.entity('stairs')
			.add(Stairs, { floor: gameMap.floor + 1 })
			.add(Position, { x: last[0], y: last[1] });

		return position;
	}
}
