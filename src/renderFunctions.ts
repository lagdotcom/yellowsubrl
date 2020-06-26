import Entity from './Entity';
import { Console, BlendMode, Map, Colours } from './tcod';
import GameMap from './GameMap';
import Location from './components/Location';
import Appearance from './components/Appearance';
import { leftpad } from './pad';
import MessageLog from './MessageLog';

export type ColourMap = { [name: string]: string };

export enum RenderOrder {
	Corpse,
	Item,
	Actor,
}

export function renderAll({
	barWidth,
	colours,
	console,
	entities,
	fovMap,
	fovRecompute,
	gameMap,
	messageLog,
	mouseX,
	mouseY,
	panel,
	panelHeight,
	panelY,
	player,
	screenHeight,
	screenWidth,
}: {
	barWidth: number;
	colours: ColourMap;
	console: Console;
	entities: Entity[];
	fovMap: Map;
	fovRecompute: boolean;
	gameMap: GameMap;
	messageLog: MessageLog;
	mouseX: number;
	mouseY: number;
	panel: Console;
	panelHeight: number;
	panelY: number;
	player: Entity;
	screenHeight: number;
	screenWidth: number;
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

	panel.clear(' ', undefined, Colours.black);

	var y = 1;
	messageLog.messages.forEach(msg => {
		panel.setDefaultForeground(msg.colour);
		panel.print(messageLog.x, y, msg.text);
		y++;
	});

	renderBar(
		panel,
		1,
		1,
		barWidth,
		'HP',
		player.fighter!.hp,
		player.fighter!.maxHp,
		Colours.lightRed,
		Colours.darkRed
	);

	panel.setDefaultForeground(Colours.lightGrey);
	panel.print(1, 0, getNamesUnderMouse(mouseX, mouseY, entities, fovMap));

	panel.blit(console, 0, panelY);
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

export function renderBar(
	panel: Console,
	x: number,
	y: number,
	totalWidth: number,
	name: string,
	value: number,
	maximum: number,
	barColour: string,
	backColor: string
) {
	const width = Math.floor((value / maximum) * totalWidth);

	panel.drawRect(x, y, totalWidth, 1, 0, undefined, backColor);

	if (width > 0) panel.drawRect(x, y, width, 1, 0, undefined, barColour);

	panel.printBox(
		Math.floor(x + totalWidth / 2),
		y,
		totalWidth,
		1,
		`${name}: ${value}/${maximum}`,
		Colours.white
	);
}

export function getNamesUnderMouse(
	x: number,
	y: number,
	entities: Entity[],
	fovMap: Map
) {
	const names = entities
		.filter(
			en =>
				en.location &&
				x == en.location.x &&
				y == en.location.y &&
				fovMap.isInFov(en.location.x, en.location.y)
		)
		.map(en => en.name);

	// TODO: title case
	return names.join(', ');
}
