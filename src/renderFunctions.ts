import Entity from './Entity';
import { Console, BlendMode, Map } from './tcod';
import GameMap from './GameMap';

export type ColourMap = { [name: string]: string };

export function renderAll({
	console,
	entities,
	gameMap,
	fovMap,
	fovRecompute,
	colours,
}: {
	console: Console;
	entities: Entity[];
	gameMap: GameMap;
	fovMap: Map;
	fovRecompute: boolean;
	colours: ColourMap;
}) {
	if (fovRecompute)
		for (var y = 0; y < gameMap.height; y++) {
			for (var x = 0; x < gameMap.width; x++) {
				const visible = fovMap.isInFov(x, y);
				const tile = gameMap.tiles[x][y];
				var key: string;
				if (visible) {
					tile.explored = true;
					key = tile.blocked ? 'lightWall' : 'lightGround';
				} else if (tile.explored) {
					key = tile.blocked ? 'darkWall' : 'darkGround';
				} else continue;

				console.setCharBackground(x, y, colours[key], BlendMode.Set);
			}
		}

	entities.forEach(e => drawEntity(console, e, fovMap));
}

export function clearAll(con: Console, entities: Entity[]) {
	entities.forEach(e => clearEntity(con, e));
}

export function drawEntity(console: Console, e: Entity, fovMap: Map) {
	if (fovMap.isInFov(e.x, e.y)) {
		console.setDefaultForeground(e.colour);
		console.putChar(e.x, e.y, e.char);
	}
}

export function clearEntity(console: Console, e: Entity) {
	console.putChar(e.x, e.y, ' ');
}
