import { Inventory, Entity } from '../ecs';
import { dropItemFromInventory } from '../systems/items';
import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';
import GameState from '../GameState';
import PlaceItemResult from '../results/PlaceItemResult';

export default class DropInventoryAction implements Action {
	name: 'dropinventory';
	constructor(public index: number) {
		this.name = 'dropinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		const inventory = entity.get(Inventory);
		if (!inventory) return results;

		const item = inventory.items[this.index];

		results.push(
			...dropItemFromInventory(item, entity),
			new PlaceItemResult(entity, item)
		);

		if (engine.gameState == GameState.DropInventory) {
			engine.refresh();
			engine.gameStateStack.pop();
		}
		engine.gameStateStack.swap(GameState.EnemyTurn);

		return results;
	}
}
