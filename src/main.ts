import './main.css';
import Tileset from './lib/Tileset';
import Engine from './Engine';
import GroovyTileset from './GroovyTileset';

async function main() {
	const bigGroovy = await Tileset.createFromUrl(
		GroovyTileset.source,
		GroovyTileset.columns,
		GroovyTileset.rows,
		GroovyTileset.charmap
	);

	const engine = new Engine([bigGroovy]);
	engine.start();
}

window.addEventListener('load', main);
