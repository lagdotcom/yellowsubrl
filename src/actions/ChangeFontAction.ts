import Engine from '../Engine';
import Action from './Action';

export default class ChangeFontAction implements Action {
	name: 'changefont';
	constructor() {
		this.name = 'changefont';
	}

	perform(engine: Engine) {
		engine.changeFont();
		return [];
	}
}
