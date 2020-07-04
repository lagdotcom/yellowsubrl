import { Console, BlendMode, Map, Colours } from './tcod';
import GameMap from './GameMap';
import MessageLog from './MessageLog';
import GameState from './GameState';
import { inventoryMenu } from './menus';
import ecs, {
	renderable,
	Position,
	Entity,
	Appearance,
	Fighter,
	Inventory,
} from './ecs';
import { XY } from './systems/movement';
import { isAt, nameOf } from './systems/entities';
import { colours, barWidth, width, height } from './constants';
import Engine from './Engine';

export type ColourMap = { [name: string]: string };

export enum RenderOrder {
	Corpse,
	Item,
	Actor,
}

export function renderAll(engine: Engine) {
	const {
		console,
		fovMap,
		fovRecompute,
		gameMap,
		gameState,
		messageLog,
		mouseX,
		mouseY,
		panel,
		panelY,
		player,
	} = engine;

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

	renderable
		.get()
		.sort((a, b) => a.get(Appearance).order - b.get(Appearance).order)
		.forEach(e => drawEntity(console, e, fovMap));

	panel.clear(' ', undefined, Colours.black);

	drawMessageLog(messageLog, panel, 1);

	const fighter = player.get(Fighter);
	renderBar(
		panel,
		1,
		1,
		barWidth,
		'HP',
		fighter.hp,
		fighter.maxHp,
		Colours.lightRed,
		Colours.darkRed
	);

	panel.setDefaultForeground(Colours.lightGrey);
	panel.print(1, 0, getNamesUnderMouse(mouseX, mouseY, fovMap));

	panel.blit(console, 0, panelY);

	var inventoryTitle = '';
	if (gameState == GameState.ShowInventory)
		inventoryTitle =
			'Press the key next to an item to use it, or Esc to cancel.\n';
	else if (gameState == GameState.DropInventory)
		inventoryTitle =
			'Press the key next to an item to drop it, or Esc to cancel.\n';

	if (inventoryTitle)
		inventoryMenu(
			console,
			inventoryTitle,
			player.get(Inventory),
			50,
			width,
			height
		);
}

export function drawMessageLog(
	messageLog: MessageLog,
	panel: Console,
	sy: number = 1
) {
	var y = sy;
	messageLog.messages.forEach(msg => {
		panel.setDefaultForeground(msg.colour);
		panel.print(messageLog.x, y, msg.text);
		y++;
	});
}

export function clearAll(con: Console) {
	renderable.get().forEach(en => clearEntity(con, en.get(Position)));
}

export function drawEntity(console: Console, en: Entity, fovMap: Map) {
	const appearance = en.get(Appearance);
	const position = en.get(Position);

	if (fovMap.isInFov(position.x, position.y)) {
		console.setDefaultForeground(appearance.colour);
		console.putChar(position.x, position.y, appearance.ch);
	}
}

export function clearEntity(console: Console, pos: XY) {
	console.putChar(pos.x, pos.y, ' ');
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

export function getNamesUnderMouse(x: number, y: number, fovMap: Map) {
	const names = ecs
		.find({ all: [Position] })
		.filter(en => isAt(en, x, y) && fovMap.isInFov(x, y))
		.map(nameOf);

	// TODO: title case
	return names.join(', ');
}
