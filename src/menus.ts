import { Console, Colours } from './tcod';
import { nameOf } from './systems/entities';
import { PrintAlign } from './libtcod/Console';
import { IInventory } from './components';

export function menu(
	con: Console,
	header: string,
	options: string[],
	width: number,
	screenWidth: number,
	screenHeight: number
) {
	if (options.length > 26) throw 'Cannot have a menu with more than 26 options';

	const headerHeight = con.getHeightRect(0, 0, width, screenHeight, header);
	const height = options.length + headerHeight;

	const window = new Console(width, height, con.tileset);
	window.printBox(0, 0, width, headerHeight, header, Colours.white);

	var optionY = headerHeight;
	var letterIndex = 'a'.charCodeAt(0);
	options.forEach(o => {
		const text = `(${String.fromCharCode(letterIndex)}) ${o}`;
		window.print(0, optionY, text);
		optionY++;
		letterIndex++;
	});

	const x = Math.floor(screenWidth / 2 - width / 2);
	const y = Math.floor(screenHeight / 2 - height / 2);
	window.blit(con, x, y);
}

export function inventoryMenu(
	con: Console,
	header: string,
	inventory: IInventory,
	inventoryWidth: number,
	screenWidth: number,
	screenHeight: number
) {
	const options =
		inventory.items.length == 0
			? ['Inventory is empty.']
			: inventory.items.map(nameOf);

	menu(con, header, options, inventoryWidth, screenWidth, screenHeight);
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
		['Play a new game', 'Continue last game'],
		24,
		screenWidth,
		screenHeight
	);
}
