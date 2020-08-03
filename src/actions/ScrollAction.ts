import Action from './Action';
import Engine from '../Engine';

export default class ScrollAction implements Action {
	constructor(public x: number, public y: number) {}

	perform(engine: Engine) {
		engine.scrollX += this.x;
		engine.scrollY += this.y;
		engine.refresh();

		return [];
	}
}
