import { Console, Colours } from './tcod';
import { PrintAlign } from './libtcod/Console';
import { getInventoryMenu } from './systems/items';
import { Entity } from './ecs';
import { Fighter, Level } from './components';
import { xpForNextLevel } from './systems/experience';
import { getStat } from './systems/stats';

export function menu(
	con: Console,
	header: string,
	options: { [key: string]: string },
	width: number,
	screenWidth: number,
	screenHeight: number
) {
	const headerHeight = con.getHeightRect(0, 0, width, screenHeight, header);
	const height = Object.keys(options).length + headerHeight;

	const window = new Console(width, height, con.tileset);
	window.printBox(0, 0, width, headerHeight, header, Colours.white);

	var optionY = headerHeight;
	Object.entries(options).forEach(([key, value]) => {
		const text = `(${key}) ${value}`;
		window.print(0, optionY, text);
		optionY++;
	});

	const x = Math.floor(screenWidth / 2 - width / 2);
	const y = Math.floor(screenHeight / 2 - height / 2);
	window.blit(con, x, y);
}

export function inventoryMenu(
	con: Console,
	header: string,
	player: Entity,
	inventoryWidth: number,
	screenWidth: number,
	screenHeight: number
) {
	menu(
		con,
		header,
		getInventoryMenu(player),
		inventoryWidth,
		screenWidth,
		screenHeight
	);
}

export function mainMenu(
	con: Console,
	screenWidth: number,
	screenHeight: number
) {
	const cy = Math.floor(screenHeight / 2);

	con.printBox(
		0,
		cy - 8,
		screenWidth,
		1,
		'Yellow Sub RL',
		Colours.lightYellow,
		undefined,
		undefined,
		PrintAlign.Center
	);
	con.printBox(
		0,
		cy - 6,
		screenWidth,
		1,
		'by Lag.Com',
		Colours.lightYellow,
		undefined,
		undefined,
		PrintAlign.Center
	);

	menu(
		con,
		'',
		{ n: 'Play a new game', l: 'Continue last game' },
		24,
		screenWidth,
		screenHeight
	);
}

export function levelUpMenu({
	console,
	header,
	player,
	width,
	screenWidth,
	screenHeight,
}: {
	console: Console;
	header: string;
	player: Entity;
	width: number;
	screenWidth: number;
	screenHeight: number;
}) {
	const fighter = player.get(Fighter);

	const options = {
		c: `Constitution (+20 HP, from ${fighter.stats.maxHp})`,
		s: `Strength (+1 attack, from ${fighter.stats.power})`,
		a: `Agility (+1 defense, from ${fighter.stats.defense})`,
	};

	menu(console, header, options, width, screenWidth, screenHeight);
}

export function characterScreen(
	console: Console,
	player: Entity,
	width: number,
	height: number,
	screenWidth: number,
	screenHeight: number
) {
	const window = new Console(width, height, console.tileset);
	const fighter = player.get(Fighter);
	const lvl = player.get(Level);

	var row = 1;
	const show = function (s: string) {
		window.printBox(0, row, width, height, s, Colours.white);
		row++;
	};

	show('Character Information');
	show(`Level: ${lvl.currentLevel}`);
	show(`Experience: ${lvl.currentXp}`);
	show(`Experience to Level: ${xpForNextLevel(player)}`);
	show(`Maximum HP: ${getStat(player, 'maxHp')}`);
	show(`Attack: ${getStat(player, 'power')}`);
	show(`Defense: ${getStat(player, 'defense')}`);

	const x = Math.floor(screenWidth / 2 - width / 2);
	const y = Math.floor(screenHeight / 2 - height / 2);
	window.blit(console, x, y);
}
