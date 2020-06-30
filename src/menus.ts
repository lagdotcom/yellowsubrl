import { Console, Colours } from './tcod';
import Inventory from './components/Inventory';
import { nameOf } from './systems/entities';

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
	inventory: Inventory,
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
