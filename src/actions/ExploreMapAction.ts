import Engine from '../Engine';
import Action from './Action';
import ecs from '../ecs';
import { Position, Appearance } from '../components';

export default class ExploreMapAction implements Action {
	perform(engine: Engine) {
		ecs
			.query({ all: [Appearance, Position] }, false)
			.get()
			.forEach(e => (e.get(Appearance).revealed = true));

		const { gameMap } = engine;
		for (var x = 0; x < gameMap.width; x++)
			for (var y = 0; y < gameMap.height; y++)
				gameMap.tiles[x][y].explored = true;

		engine.fovRecompute = true;
		return [];
	}
}
