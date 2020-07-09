import { Console, Colours } from './tcod';
import { PrintAlign } from './libtcod/Console';
import { getInventoryMenu } from './systems/items';
import { Entity } from './ecs';

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
