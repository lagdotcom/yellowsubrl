import Entity from './Entity';
import { Console, BlendMode, Map, Colours } from './tcod';
import GameMap from './GameMap';
import Location from './components/Location';
import Appearance from './components/Appearance';
import { leftpad } from './pad';

export type ColourMap = { [name: string]: string };

export enum RenderOrder {
	Corpse,
	Item,
	Actor,
}

export function renderAll({
	console,
	entities,
	player,
	gameMap,
	fovMap,
	screenWidth,
	screenHeight,
	fovRecompute,
	colours,
}: {
	console: Console;
	entities: Entity[];
	player: Entity;
	gameMap: GameMap;
	fovMap: Map;
	screenWidth: number;
	screenHeight: number;
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

	const drawable = entities
		.filter(e => e.appearance && e.location)
		.sort((a, b) => a.appearance!.order - b.appearance!.order);

	drawable.forEach(e =>
		drawEntity(console, e.appearance!, e.location!, fovMap)
	);

	console.printBox(
		1,
		screenHeight - 2,
		10,
		1,
		`HP: ${leftpad(player.fighter!.hp, 2, '0')}/${leftpad(
			player.fighter!.maxHp,
			2,
			'0'
		)}`,
		Colours.white,
		Colours.black
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
