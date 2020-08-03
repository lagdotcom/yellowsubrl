import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';

export default class LoadGameAction implements Action {
	perform(engine: Engine): Result[] {
		engine.loadGame();
		return [];
	}
}
