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

async function main() {
	const width = 80;
	const height = 50;

	var player_x = width / 2;
	var player_y = height / 2;

	const font = await console_set_custom_font(
		arial10x10,
		FontFlags.TypeGreyscale | FontFlags.LayoutTCOD
	);

	var lastReportTime = new Date().getTime();
	var ticks = 0;
	var fpsString = '';

	console_init_root(width, height, font).main(function main_loop(con) {
		const { key, mouse } = sys.check_for_event(KeyPress);

		con.set_default_foreground(Colours.red);
		con.put_char(player_x, player_y, '@', BlendMode.None);

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

		con.put_char(player_x, player_y, ' ', BlendMode.None);
		const action = handle_keys(key);

		if (action.move) {
			const [dx, dy] = action.move;

			player_x += dx;
			player_y += dy;
		}

		if (action.exit) return con.stop();

		if (action.fullscreen) {
			alert('No idea how to do that yet');
		}
	});
}

window.addEventListener('load', main);
