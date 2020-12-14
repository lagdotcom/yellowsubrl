import Colours from './Colours';
import TileConsole, { PrintAlign } from './lib/TileConsole';
import { getInventoryMenu } from './systems/items';
import { Entity } from './ecs';
import { Fighter, Level } from './components';
import { xpForNextLevel } from './systems/experience';
import { getStat } from './systems/stats';
import scenarios from './scenarios';

const scenarioDescriptions: { [key: string]: string } = {};
Object.entries(scenarios).forEach(
	([key, scen]) => (scenarioDescriptions[key] = scen.description)
);

export function menu(
	con: TileConsole,
	header: string,
	options: { [key: string]: string },
	screenWidth: number,
	screenHeight: number,
	width?: number
) {
	if (width === undefined) {
		width = Math.max(
			header.length,
			...Object.values(options).map(s => s.length + 4)
		);
	}

	const headerHeight = con.getHeightRect(0, 0, width, screenHeight, header) + 1;
	const height = Object.keys(options).length + headerHeight - 1;

	const window = new TileConsole(width + 2, height + 2, con.tileset);
	window.printBorder(0, 0, width + 1, height + 1);
	window.printBox(1, 1, width, headerHeight, header, Colours.white);

	var optionY = headerHeight;
	Object.entries(options).forEach(([key, value]) => {
		const text = `(${key}) ${value}`;
		window.print(1, optionY, text);
		optionY++;
	});

	const x = Math.floor(screenWidth / 2 - width / 2);
	const y = Math.floor(screenHeight / 2 - height / 2);
	window.blit(con, x, y);
}

export function inventoryMenu(
	con: TileConsole,
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
		screenWidth,
		screenHeight,
		inventoryWidth
	);
}

function mainMenuHeader(
	con: TileConsole,
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
}

export function mainMenu(
	con: TileConsole,
	screenWidth: number,
	screenHeight: number
) {
	mainMenuHeader(con, screenWidth, screenHeight);

	menu(
		con,
		'',
		{ n: 'Play a new game', l: 'Continue last game' },
		screenWidth,
		screenHeight,
		24
	);
}

export function setupMenu(
	con: TileConsole,
	screenWidth: number,
	screenHeight: number
) {
	mainMenuHeader(con, screenWidth, screenHeight);

	menu(
		con,
		'Choose a scenario.',
		scenarioDescriptions,
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
	console: TileConsole;
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

	menu(console, header, options, screenWidth, screenHeight, width);
}

export function characterScreen(
	console: TileConsole,
	player: Entity,
	width: number,
	height: number,
	screenWidth: number,
	screenHeight: number
) {
	const window = new TileConsole(width, height, console.tileset);
	const lvl = player.get(Level);

	var row = 1;
	const show = function (s: string) {
		window.printBox(1, row, width, height, s, Colours.white);
		row++;
	};

	window.printBorder(0, 0, width - 1, height - 1);
	show('Character Information');
	row++;

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
