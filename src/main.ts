import './main.css';
import arialSrc from '../res/arial10x10.png';
import groovySrc from '../res/groovy10x10.png';
import {
	Charmap,
	Colours,
	Console,
	KeyPress,
	sys,
	Terminal,
	toRGB,
	Tileset,
} from './tcod';
import { handleKeys } from './inputHandlers';
import Entity from './Entity';
import { renderAll, clearAll } from './renderFunctions';
import GameMap from './GameMap';
import RNG from './RNG';

async function main() {
	const rng = new RNG();
	(window as any).rng = rng;

	const width = 60;
	const height = 40;

	const mapWidth = width;
	const mapHeight = height - 5;

	const roomMaxSize = 10;
	const roomMinSize = 6;
	const maxRooms = 30;

	const colours = {
		darkWall: toRGB(0, 0, 100),
		darkGround: toRGB(50, 50, 150),
	};

	const player = new Entity(width / 2, height / 2, '@', Colours.white);
	const npc = new Entity(width / 2 - 5, height / 2, '@', Colours.yellow);
	const entities = [player, npc];

	const gameMap = new GameMap(rng.seed, mapWidth, mapHeight);
	(window as any).map = gameMap;
	gameMap.makeMap(
		rng,
		maxRooms,
		roomMinSize,
		roomMaxSize,
		mapWidth,
		mapHeight,
		player
	);

	const arial = await Tileset.createFromUrl(arialSrc, 32, 8, Charmap.TCOD);
	const groovy = await Tileset.createFromUrl(groovySrc, 32, 8, Charmap.TCOD);
	var tileset = groovy;

	var lastReportTime = new Date().getTime();
	var ticks = 0;
	var fpsString = '';

	const context = new Terminal(width, height, tileset);
	(window as any).term = context;
	context.element.style.height = `${context.element.height * 2}px`;

	const rootConsole = new Console(width, height);
	(window as any).con = rootConsole;

	context.main(function loop() {
		const { key } = sys.checkForEvents(KeyPress);
		renderAll(rootConsole, entities, gameMap, colours);

		const time = new Date().getTime();
		ticks++;

		if (time - lastReportTime > 1000) {
			fpsString = `${ticks} fps`;

			lastReportTime = time;
			ticks = 0;
		}

		rootConsole.setDefaultForeground(Colours.white);
		rootConsole.printRect(0, 0, 10, 1, fpsString);

		rootConsole.printRect(
			0,
			1,
			100,
			1,
			'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG?'
		);
		rootConsole.setDefaultForeground(Colours.yellow);
		rootConsole.printRect(
			0,
			2,
			100,
			1,
			'the quick brown fox jumps over the lazy dog!'
		);
		context.present(rootConsole);

		clearAll(rootConsole, entities);
		const action = handleKeys(key);

		if (action.move) {
			const [dx, dy] = action.move;

			if (!gameMap.isBlocked(player.x + dx, player.y + dy)) player.move(dx, dy);
		}

		if (action.exit) return context.stop();

		if (action.fullscreen) {
			alert('No idea how to do that yet');
		}

		if (action.remake) {
			gameMap.reset(rng.seed, mapWidth, mapHeight);
			gameMap.makeMap(
				rng,
				maxRooms,
				roomMinSize,
				roomMaxSize,
				mapWidth,
				mapHeight,
				player
			);
		}

		if (action.changeFont) {
			tileset = tileset == arial ? groovy : arial;
			context.tileset = tileset;
		}
	});
}

window.addEventListener('load', main);
