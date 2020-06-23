import './main.css';
import arialSrc from '../res/arial10x10.png';
import groovySrc from '../res/groovy10x10.png';
import {
	Charmap,
	Colours,
	Console,
	FovAlgorithm,
	KeyDown,
	sys,
	Terminal,
	Tileset,
	toRGB,
} from './tcod';
import { handleKeys } from './inputHandlers';
import Entity, { getBlockingEntitiesAtLocation } from './Entity';
import { renderAll, clearAll } from './renderFunctions';
import GameMap from './GameMap';
import RNG from './RNG';
import { initializeFov, recomputeFov } from './fovFunctions';
import GameState from './GameState';
import BoxesAndCorridors from './generator/BoxesAndCorridors';
import Engine from './Engine';

async function main() {
	const rng = new RNG();

	const width = 60;
	const height = 40;

	const mapWidth = width;
	const mapHeight = height - 5;

	const roomMaxSize = 10;
	const roomMinSize = 6;
	const maxRooms = 30;

	const fovAlgorithm = FovAlgorithm.Raycasting;
	const fovLightWalls = true;
	const fovRadius = 10;

	const maxMonstersPerRoom = 3;

	const colours = {
		darkWall: toRGB(0, 0, 100),
		darkGround: toRGB(50, 50, 150),
		lightWall: toRGB(130, 110, 50),
		lightGround: toRGB(200, 180, 50),
	};

	const mapGenerator = new BoxesAndCorridors({
		maxRooms,
		roomMinSize,
		roomMaxSize,
		mapWidth,
		mapHeight,
		maxMonstersPerRoom,
	});

	const arial = await Tileset.createFromUrl(arialSrc, 32, 8, Charmap.TCOD);
	const groovy = await Tileset.createFromUrl(groovySrc, 32, 8, Charmap.TCOD);

	const engine = new Engine(
		colours,
		fovAlgorithm,
		fovLightWalls,
		fovRadius,
		mapGenerator,
		mapWidth,
		mapHeight,
		rng,
		[groovy, arial],
		width,
		height
	);

	const tileset = engine.tilesets[0];
	const context = new Terminal(
		width * tileset.tileWidth,
		height * tileset.tileHeight
	);
	context.element.style.height = `${context.element.height * 2}px`;

	context.main(function loop() {
		engine.render(context);

		const { key } = sys.checkForEvents(KeyDown);
		const action = handleKeys(key);
		if (action) action.perform(engine, engine.player);

		engine.enemyActions();
	});
}

window.addEventListener('load', main);
