import Result from './Result';
import Engine from '../Engine';
import GameState from '../GameState';

export default class ConsumeTurnResult implements Result {
	perform(engine: Engine) {
		if (engine.gameStateStack.top === GameState.PlayerTurn)
			engine.gameStateStack.swap(GameState.EnemyTurn);

		return [];
	}
}
