import Action from './Action';
import Engine from '../Engine';
import ConsumeTurnResult from '../results/ConsumeTurnResult';

export default class WaitAction implements Action {
	perform() {
		return [new ConsumeTurnResult()];
	}
}
