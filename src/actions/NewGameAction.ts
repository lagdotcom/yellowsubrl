import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';

export default class NewGameAction implements Action {
	name: 'newgame';
	constructor() {
		this.name = 'newgame';
	}

	perform(engine: Engine): Result[] {
		engine.newGame();
		return [];
	}
}
