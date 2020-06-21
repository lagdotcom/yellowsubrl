import Entity from './Entity';
import { Console, BlendMode } from './tcod';
import GameMap from './GameMap';

export function renderAll(
	con: Console,
	entities: Entity[],
	gameMap: GameMap,
	colours: { [name: string]: string }
) {
	for (var y = 0; y < gameMap.height; y++) {
		for (var x = 0; x < gameMap.width; x++) {
			const wall = gameMap.tiles[x][y];
			const colour = wall.blockSight ? colours.darkWall : colours.darkGround;

			con.setCharBackground(x, y, colour, BlendMode.Set);
		}
	}

	entities.forEach(e => drawEntity(con, e));
}

export function clearAll(con: Console, entities: Entity[]) {
	entities.forEach(e => clearEntity(con, e));
}

export function drawEntity(con: Console, e: Entity) {
	con.setDefaultForeground(e.colour);
	con.putChar(e.x, e.y, e.char, BlendMode.None);
}

export function clearEntity(con: Console, e: Entity) {
	con.putChar(e.x, e.y, ' ', BlendMode.None);
}
