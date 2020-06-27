import Action from './Action';
import Engine from '../Engine';
import Entity from '../Entity';
import Result from '../results/Result';
import GameState from '../GameState';
import { HasInventory } from '../components/Inventory';

export default class DropInventoryAction implements Action {
	name: 'dropinventory';
	constructor(public index: number) {
		this.name = 'dropinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];
		if (!entity.inventory || !entity.location) return results;

		const item = entity.inventory.items[this.index];
		results.push(...entity.inventory.dropItem(entity as HasInventory, item));

		if (engine.gameState == GameState.DropInventory) {
			engine.refresh();
			engine.gameStateStack.pop();
		}
		engine.gameStateStack.swap(GameState.EnemyTurn);

		return results;
	}
}
