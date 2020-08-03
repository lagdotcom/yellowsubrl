import Engine from '../Engine';
import { Position } from '../components';

export default class RemakeAction {
	perform(engine: Engine) {
		engine.player.remove(Position); // this prevents the player from being deleted
		engine.newMap();
		return [];
	}
}
