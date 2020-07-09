import ecs, { Entity } from '../ecs';
import { dropItemFromInventory } from '../systems/items';
import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';
import GameState from '../GameState';
import PlaceItemResult from '../results/PlaceItemResult';
import { Inventory } from '../components';

export default class DropInventoryAction implements Action {
	name: 'dropinventory';
	constructor(public slot: string) {
		this.name = 'dropinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		const inventory = entity.get(Inventory);
		if (!inventory) return results;

		const itemId = inventory.items[this.slot];
		if (!itemId) return results;

		const itemEntity = ecs.getEntity(itemId);
		if (!itemEntity) return results;

		results.push(
			...dropItemFromInventory(itemEntity, entity),
			new PlaceItemResult(entity, itemEntity)
		);

		if (engine.gameState == GameState.DropInventory) {
			engine.refresh();
			engine.gameStateStack.pop();
		}
		engine.gameStateStack.swap(GameState.EnemyTurn);

		return results;
	}
}
