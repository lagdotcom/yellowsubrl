import Result from './Result';
import Engine from '../Engine';
import GameState from '../GameState';

export default class CloseInventoryResult implements Result {
	perform(engine: Engine) {
		if (
			engine.gameState == GameState.ShowInventory ||
			engine.gameState == GameState.DropInventory
		) {
			engine.refresh();
			engine.gameStateStack.pop();
		}

		return [];
	}
}
