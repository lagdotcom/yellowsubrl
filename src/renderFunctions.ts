import Entity from './Entity';
import { Console, BlendMode } from './tcod';
import GameMap from './GameMap';

export function renderAll(
	con: Console,
	entities: Entity[],
	gameMap: GameMap,
	screenWidth: number,
	screenHeight: number,
	colours: { [name: string]: string }
) {
	for (var y = 0; y < gameMap.height; y++) {
		for (var x = 0; x < gameMap.width; x++) {
			const wall = gameMap.tiles[x][y];
			const colour = wall.block_sight ? colours.dark_wall : colours.dark_ground;

			con.set_char_background(x, y, colour, BlendMode.Set);
		}
	}

	entities.forEach(e => drawEntity(con, e));
}

export function clearAll(con: Console, entities: Entity[]) {
	entities.forEach(e => clearEntity(con, e));
}

export function drawEntity(con: Console, e: Entity) {
	con.set_default_foreground(e.colour);
	con.put_char(e.x, e.y, e.char, BlendMode.None);
}

export function clearEntity(con: Console, e: Entity) {
	con.put_char(e.x, e.y, ' ', BlendMode.None);
}
