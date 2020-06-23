import Entity from './Entity';
import { Console, BlendMode, Map } from './tcod';
import GameMap from './GameMap';

export function renderAll(
	con: Console,
	entities: Entity[],
	gameMap: GameMap,
	fovMap: Map,
	fovRecompute: boolean,
	colours: { [name: string]: string }
) {
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

				con.setCharBackground(x, y, colours[key], BlendMode.Set);
			}
		}

	entities.forEach(e => drawEntity(con, e, fovMap));
}

export function clearAll(con: Console, entities: Entity[]) {
	entities.forEach(e => clearEntity(con, e));
}

export function drawEntity(con: Console, e: Entity, fovMap: Map) {
	if (fovMap.isInFov(e.x, e.y)) {
		con.setDefaultForeground(e.colour);
		con.putChar(e.x, e.y, e.char, BlendMode.None);
	}
}

export function clearEntity(con: Console, e: Entity) {
	con.putChar(e.x, e.y, ' ', BlendMode.None);
}
