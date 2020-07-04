import './main.css';
import { Charmap, Tileset } from './tcod';
import arialSrc from '../res/arial10x10.png';
import groovySrc from '../res/groovy10x10.png';
import Engine from './Engine';

async function main() {
	const arial = await Tileset.createFromUrl(arialSrc, 32, 8, Charmap.TCOD);
	const groovy = await Tileset.createFromUrl(groovySrc, 32, 8, Charmap.TCOD);

	const engine = new Engine([groovy, arial]);
	engine.start();
}

window.addEventListener('load', main);
