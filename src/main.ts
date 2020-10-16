import './main.css';
import { Tileset } from './tcod';
import Engine from './Engine';
import GroovyTileset from './GroovyTileset';
import initPlayerPrefabs from './features/players';

async function main() {
	const bigGroovy = await Tileset.createFromUrl(
		GroovyTileset.source,
		GroovyTileset.columns,
		GroovyTileset.rows,
		GroovyTileset.charmap
	);

	initPlayerPrefabs();

	const engine = new Engine([bigGroovy]);
	engine.start();
}

window.addEventListener('load', main);
