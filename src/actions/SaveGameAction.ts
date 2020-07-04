import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';
import MessageResult from '../results/MessageResult';

export default class SaveGameAction implements Action {
	name: 'savegame';
	constructor() {
		this.name = 'savegame';
	}

	perform(engine: Engine): Result[] {
		engine.saveGame();
		engine.messageLog.add(new MessageResult('Game saved.'));

		return [];
	}
}
