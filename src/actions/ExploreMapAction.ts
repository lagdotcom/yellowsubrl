import Engine from '../Engine';
import Action from './Action';

export default class ExploreMapAction implements Action {
	perform(engine: Engine) {
		const { gameMap } = engine;
		for (var x = 0; x < gameMap.width; x++)
			for (var y = 0; y < gameMap.height; y++)
				gameMap.tiles[x][y].explored = true;

		engine.fovRecompute = true;
		return [];
	}
}
