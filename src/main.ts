import './main.css';
import arialSrc from '../res/arial10x10.png';
import groovySrc from '../res/groovy10x10.png';
import { Charmap, FovAlgorithm, Tileset, toRGB } from './tcod';
import RNG from './RNG';
import BoxesAndCorridors from './generator/BoxesAndCorridors';
import Engine from './Engine';
import BSPTree from './generator/BSPTree';

async function main() {
	const rng = new RNG();

	const width = 60;
	const height = 40;

	const barWidth = 20;
	const panelHeight = 7;

	const messageX = barWidth + 2;
	const messageWidth = width - barWidth - 2;
	const messageHeight = panelHeight - 1;

	const mapWidth = width;
	const mapHeight = height - panelHeight;

	const roomMaxSize = 10;
	const roomMinSize = 6;
	const maxRooms = 30;

	const fovAlgorithm = FovAlgorithm.RedBlob;
	const fovLightWalls = true;
	const fovRadius = 10;

	const maxMonstersPerRoom = 3;
	const maxItemsPerRoom = 2;

	const colours = {
		darkWall: toRGB(0, 0, 100),
		darkGround: toRGB(50, 50, 150),
		lightWall: toRGB(130, 110, 50),
		lightGround: toRGB(200, 180, 50),
	};

	// const mapGenerator = new BoxesAndCorridors({
	// 	maxRooms,
	// 	roomMinSize,
	// 	roomMaxSize,
	// 	mapWidth,
	// 	mapHeight,
	// 	maxMonstersPerRoom,
	// });
	const mapGenerator = new BSPTree(
		5,
		10,
		20,
		75,
		maxMonstersPerRoom,
		maxItemsPerRoom
	);

	const arial = await Tileset.createFromUrl(arialSrc, 32, 8, Charmap.TCOD);
	const groovy = await Tileset.createFromUrl(groovySrc, 32, 8, Charmap.TCOD);

	const engine = new Engine({
		barWidth,
		colours,
		fovAlgorithm,
		fovLightWalls,
		fovRadius,
		height,
		mapGenerator,
		mapHeight,
		mapWidth,
		messageX,
		messageHeight,
		messageWidth,
		panelHeight,
		rng,
		tilesets: [groovy, arial],
		width,
	});

	engine.start();
}

window.addEventListener('load', main);
