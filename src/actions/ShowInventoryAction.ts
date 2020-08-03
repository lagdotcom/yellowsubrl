import { Entity } from '../ecs';
import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';
import { Inventory } from '../components';

export default class ShowInventoryAction implements Action {
	constructor(private state: GameState) {}

	perform(engine: Engine, entity: Entity) {
		if (entity.has(Inventory)) engine.gameStateStack.push(this.state);

		return [];
	}
}
