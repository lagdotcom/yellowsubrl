import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';
import GameState from '../GameState';

export default class ChooseScenarioAction implements Action {
	perform(engine: Engine): Result[] {
		engine.gameStateStack.swap(GameState.ChoosingSetup);
		return [];
	}
}
