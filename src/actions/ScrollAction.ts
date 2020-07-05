import Action from './Action';
import Engine from '../Engine';

export default class ScrollAction implements Action {
	name: 'scroll';
	constructor(public x: number, public y: number) {
		this.name = 'scroll';
	}

	perform(engine: Engine) {
		engine.scrollX += this.x;
		engine.scrollY += this.y;
		engine.refresh();

		return [];
	}
}
