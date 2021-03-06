import RNG from './RNG';
import XY from './XY';
import GameMap from './GameMap';
import Realm from './Realm';

export default interface MapGenerator {
	generate(realm: Realm, rng: RNG, gameMap: GameMap): XY;
}
