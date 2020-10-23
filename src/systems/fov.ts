import GameMap from '../GameMap';
import TileMap, { FovAlgorithm } from '../lib/TileMap';

export function initializeFov(gameMap: GameMap) {
	const fovMap = new TileMap(gameMap.width, gameMap.height);

	for (var x = 0; x < fovMap.width; x++) {
		for (var y = 0; y < fovMap.height; y++) {
			fovMap.setProperties(
				x,
				y,
				!gameMap.tiles[x][y].blockSight,
				!gameMap.tiles[x][y].blocked
			);
		}
	}

	return fovMap;
}

export function recomputeFov(
	fovMap: TileMap,
	x: number,
	y: number,
	radius: number,
	lightWalls: boolean = true,
	algorithm: FovAlgorithm = FovAlgorithm.Raycasting
) {
	fovMap.computeFov(x, y, radius, lightWalls, algorithm);
}
