import Engine from '../Engine';

export default class RemakeAction {
	name: 'remake';
	constructor() {
		this.name = 'remake';
	}

	perform(engine: Engine) {
		engine.newMap();
		return [];
	}
}
