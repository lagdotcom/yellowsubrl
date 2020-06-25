import Engine from '../Engine';

export default class RemakeAction {
	perform(engine: Engine) {
		engine.newMap();
		return [];
	}
}
