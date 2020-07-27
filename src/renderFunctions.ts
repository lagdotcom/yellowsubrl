import { Console, BlendMode, Map, Colours } from './tcod';
import MessageLog from './MessageLog';
import GameState from './GameState';
import { inventoryMenu, levelUpMenu } from './menus';
import ecs, { Entity } from './ecs';
import { isAt, nameOf } from './systems/entities';
import {
	colours,
	barWidth,
	width,
	height,
	mapDisplayHeight,
	mapDisplayWidth,
} from './constants';
import Engine from './Engine';
import GameMap from './GameMap';
import { renderable } from './queries';
import { Appearance, Fighter, Position } from './components';

export type ColourMap = { [name: string]: string };

export enum RenderOrder {
	Stairs,
	Corpse,
	Item,
	Actor,
}

function renderMap(
	con: Console,
	gameMap: GameMap,
	fovMap: Map,
	sx: number,
	sy: number
) {
	for (var yo = 0; yo < mapDisplayHeight; yo++) {
		const y = sy + yo;
		for (var xo = 0; xo < mapDisplayWidth; xo++) {
			const x = sx + xo;

			if (gameMap.contains(x, y)) {
				const vx = xo * 2;
				const visible = fovMap.isInFov(x, y);
				const tile = gameMap.tiles[x][y];
				var key: string;
				if (visible) {
					tile.explored = true;
					key = tile.blocked ? 'lightWall' : 'lightGround';
				} else if (tile.explored) {
					key = tile.blocked ? 'darkWall' : 'darkGround';
				} else continue;

				con.setCharBackground(vx, yo, colours[key], BlendMode.Set);
				con.setCharBackground(vx + 1, yo, colours[key], BlendMode.Set);
			}
		}
	}
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
		scrollX,
		scrollY,
	} = engine;

	if (fovRecompute) renderMap(console, gameMap, fovMap, scrollX, scrollY);

	renderable
		.get()
		.sort((a, b) => a.get(Appearance).order - b.get(Appearance).order)
		.forEach(e => drawEntity(console, e, fovMap, scrollX, scrollY));

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
	panel.print(1, 3, `Dungeon level: ${gameMap.floor}`);

	panel.blit(console, 0, panelY);

	var inventoryTitle = '';
	if (gameState == GameState.ShowInventory)
		inventoryTitle =
			'Press the key next to an item to use it, or Esc to cancel.\n';
	else if (gameState == GameState.DropInventory)
		inventoryTitle =
			'Press the key next to an item to drop it, or Esc to cancel.\n';

	if (inventoryTitle)
		inventoryMenu(console, inventoryTitle, player, 50, width, height);

	if (gameState == GameState.LevelUp)
		levelUpMenu({
			console,
			header: 'Level up! Choose a stat to raise',
			player,
			width: 40,
			screenWidth: width,
			screenHeight: height,
		});
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

export function clearAll(con: Console, ox: number, oy: number) {
	renderable.get().forEach(en => clearEntity(con, ox, oy, en));
}

export function drawEntity(
	console: Console,
	en: Entity,
	fovMap: Map,
	ox: number,
	oy: number
) {
	const appearance = en.get(Appearance);
	const position = en.get(Position);

	if (fovMap.isInFov(position.x, position.y) || appearance.revealed) {
		const vx = (position.x - ox) * 2;
		const vy = position.y - oy;
		if (appearance.revealforever) appearance.revealed = true;

		console.setDefaultForeground(appearance.colour);
		console.putChar(vx, vy, appearance.tile);
		if (appearance.tile2) console.putChar(vx + 1, vy, appearance.tile2);
	}
}

export function clearEntity(
	console: Console,
	ox: number,
	oy: number,
	en: Entity
) {
	const appearance = en.get(Appearance);
	const position = en.get(Position);
	const vx = (position.x - ox) * 2;
	const vy = position.y - oy;

	console.putChar(vx, vy, ' ');
	if (appearance.tile2) console.putChar(vx + 1, vy, ' ');
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
