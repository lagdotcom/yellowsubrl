import Engine from '../Engine';
import Action from './Action';

export default class ChangeFontAction implements Action {
	perform(engine: Engine) {
		engine.changeFont();
		return [];
	}
}
