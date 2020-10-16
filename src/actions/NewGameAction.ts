import Engine from '../Engine';
import Result from '../results/Result';
import Scenario from '../Scenario';
import Action from './Action';

export default class NewGameAction implements Action {
	constructor(public scen: Scenario) {}

	perform(engine: Engine): Result[] {
		engine.newGame(this.scen);
		return [];
	}
}
