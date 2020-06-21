import arial10x10 from '../res/arial10x10.png';
import {
	BlendMode,
	Colours,
	console_init_root,
	console_set_custom_font,
	FontFlags,
	KeyPress,
	sys,
	toRGB,
} from './tcod';
import { handle_keys } from './inputHandlers';
import Entity from './Entity';
import { renderAll, clearAll } from './renderFunctions';
import GameMap from './GameMap';

async function main() {
	const width = 80;
	const height = 50;

	const mapWidth = 80;
	const mapHeight = 45;

	const colours = {
		dark_wall: toRGB(0, 0, 100),
		dark_ground: toRGB(50, 50, 150),
	};

	const player = new Entity(width / 2, height / 2, '@', Colours.white);
	const npc = new Entity(width / 2 - 5, height / 2, '@', Colours.yellow);
	const entities = [player, npc];

	const gameMap = new GameMap(mapWidth, mapHeight);

	const font = await console_set_custom_font(
		arial10x10,
		FontFlags.TypeGreyscale | FontFlags.LayoutTCOD
	);

	var lastReportTime = new Date().getTime();
	var ticks = 0;
	var fpsString = '';

	console_init_root(width, height, font).main(function main_loop(con) {
		const { key, mouse } = sys.check_for_event(KeyPress);
		renderAll(con, entities, gameMap, width, height, colours);

		const time = new Date().getTime();
		ticks++;

		if (time - lastReportTime > 1000) {
			fpsString = `${ticks} fps`;

			lastReportTime = time;
			ticks = 0;
		}

		con.set_default_foreground(Colours.white);
		con.print_rect(0, 0, 10, 1, fpsString);
		con.flush();

		clearAll(con, entities);
		const action = handle_keys(key);

		if (action.move) {
			const [dx, dy] = action.move;

			if (!gameMap.isBlocked(player.x + dx, player.y + dy)) player.move(dx, dy);
		}

		if (action.exit) return con.stop();

		if (action.fullscreen) {
			alert('No idea how to do that yet');
		}
	});
}

window.addEventListener('load', main);
