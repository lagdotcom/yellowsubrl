import Action from './Action';
import Engine from '../Engine';

export default class ExitAction implements Action {
	name: 'exit';
	constructor() {
		this.name = 'exit';
	}

	perform(engine: Engine) {
		if (engine.gameStateStack.size > 1) {
			engine.refresh();
			engine.gameStateStack.pop();
		}

		return [];
	}
}
