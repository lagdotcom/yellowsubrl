import { Entity, Inventory } from '../ecs';
import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';

export default class ShowInventoryAction implements Action {
	name: 'showinventory';
	constructor(private state: GameState) {
		this.name = 'showinventory';
	}

	perform(engine: Engine, entity: Entity) {
		if (engine.gameState == GameState.PlayerTurn && entity.get(Inventory))
			engine.gameStateStack.push(this.state);

		return [];
	}
}
