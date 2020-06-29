import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';
import MessageResult from '../results/MessageResult';

export default class CancelTargetingAction implements Action {
	name: 'canceltargeting';
	constructor() {
		this.name = 'canceltargeting';
	}

	perform(engine: Engine) {
		if (engine.gameState == GameState.Targeting) {
			engine.refresh();
			engine.gameStateStack.pop();
		}

		return [new MessageResult('Targeting cancelled.')];
	}
}
