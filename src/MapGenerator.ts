import RNG from './RNG';
import XY from './XY';
import GameMap from './GameMap';

export interface MapGenerator {
	generate(rng: RNG, gameMap: GameMap): XY;
}
