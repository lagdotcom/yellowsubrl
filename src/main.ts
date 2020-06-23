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
	FovAlgorithm,
} from './tcod';
import { handleKeys } from './inputHandlers';
import Entity, { getBlockingEntitiesAtLocation } from './Entity';
import { renderAll, clearAll } from './renderFunctions';
import GameMap from './GameMap';
import RNG from './RNG';
import { initializeFov, recomputeFov } from './fovFunctions';
import GameState from './GameState';

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

	const player = new Entity(0, 0, '@', Colours.white, 'Player', true);
	const entities = [player];

	const gameMap = new GameMap(rng.seed, mapWidth, mapHeight);
	(window as any).map = gameMap;
	gameMap.makeMap(
		rng,
		maxRooms,
		roomMinSize,
		roomMaxSize,
		mapWidth,
		mapHeight,
		player,
		entities,
		maxMonstersPerRoom
	);

	var fovRecompute = true;
	var fovMap = initializeFov(gameMap);

	const arial = await Tileset.createFromUrl(arialSrc, 32, 8, Charmap.TCOD);
	const groovy = await Tileset.createFromUrl(groovySrc, 32, 8, Charmap.TCOD);
	var tileset = groovy;

	var lastReportTime = new Date().getTime();
	var ticks = 0;
	var fpsString = '';

	const context = new Terminal(
		width * arial.tileWidth,
		height * arial.tileHeight
	);
	(window as any).context = context;
	context.element.style.height = `${context.element.height * 2}px`;

	const con = new Console(width, height, tileset);
	(window as any).con = con;

	var gameState = GameState.PlayerTurn;

	context.main(function loop() {
		const { key } = sys.checkForEvents(KeyPress);

		if (fovRecompute)
			recomputeFov(
				fovMap,
				player.x,
				player.y,
				fovRadius,
				fovLightWalls,
				fovAlgorithm
			);

		renderAll(con, entities, gameMap, fovMap, fovRecompute, colours);
		fovRecompute = false;

		const time = new Date().getTime();
		ticks++;

		if (time - lastReportTime > 1000) {
			fpsString = `${ticks} fps`;

			lastReportTime = time;
			ticks = 0;
		}

		con.printBox(0, 0, 10, 1, fpsString, Colours.white, Colours.black);
		context.present(con);

		clearAll(con, entities);
		const action = handleKeys(key);

		if (action.move && gameState == GameState.PlayerTurn) {
			const [mx, my] = action.move;
			const dx = player.x + mx,
				dy = player.y + my;

			if (!gameMap.isBlocked(dx, dy)) {
				const target = getBlockingEntitiesAtLocation(entities, dx, dy);
				if (target) {
					console.log(
						`You kick the ${target.name} in the shins, much to its annoyance!`
					);
				} else {
					player.move(mx, my);
					fovRecompute = true;
				}

				gameState = GameState.EnemyTurn;
			}
		}

		if (action.exit) return context.stop();

		if (action.fullscreen) {
			alert('No idea how to do that yet');
		}

		if (action.remake) {
			entities.splice(0, entities.length, player);

			gameMap.reset(rng.seed, mapWidth, mapHeight);
			gameMap.makeMap(
				rng,
				maxRooms,
				roomMinSize,
				roomMaxSize,
				mapWidth,
				mapHeight,
				player,
				entities,
				maxMonstersPerRoom
			);

			fovMap = initializeFov(gameMap);
			fovRecompute = true;
			con.clear();
		}

		if (action.changeFont) {
			tileset = tileset == arial ? groovy : arial;
			con.tileset = tileset;
			fovRecompute = true;
		}

		if (gameState == GameState.EnemyTurn) {
			entities.forEach(e => {
				if (e != player)
					console.log(`The ${e.name} ponders the meaning of its existence.`);
			});

			gameState = GameState.PlayerTurn;
		}
	});
}

window.addEventListener('load', main);
