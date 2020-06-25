import Entity from './Entity';
import { Console, BlendMode, Map } from './tcod';
import GameMap from './GameMap';
import Location from './components/Location';
import Appearance from './components/Appearance';

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

	entities.forEach(
		e =>
			e.appearance &&
			e.location &&
			drawEntity(console, e.appearance, e.location, fovMap)
	);
}

export function clearAll(con: Console, entities: Entity[]) {
	entities.forEach(e => e.location && clearEntity(con, e.location));
}

export function drawEntity(
	console: Console,
	app: Appearance,
	loc: Location,
	fovMap: Map
) {
	if (fovMap.isInFov(loc.x, loc.y)) {
		console.setDefaultForeground(app.colour);
		console.putChar(loc.x, loc.y, app.ch);
	}
}

export function clearEntity(console: Console, loc: Location) {
	console.putChar(loc.x, loc.y, ' ');
}
