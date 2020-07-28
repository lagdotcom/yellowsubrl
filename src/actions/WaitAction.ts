import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';

export default class WaitAction implements Action {
	name: string;
	constructor() {
		this.name = 'wait';
	}

	perform(engine: Engine) {
		engine.gameStateStack.swap(GameState.EnemyTurn);
		return [];
	}
}
