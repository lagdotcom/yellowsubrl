import Action from './Action';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import Result from '../results/Result';
import GameState from '../GameState';
import ecs, { Entity } from '../ecs';
import { nameOf } from '../systems/entities';
import { Inventory, Item } from '../components';

export default class UseInventoryAction implements Action {
	name: 'useinventory';
	constructor(public slot: string) {
		this.name = 'useinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		const inventory = entity.get(Inventory);
		if (!inventory) return results;

		const itemId = inventory.items[this.slot];
		if (!itemId) return results;

		const itemEntity = ecs.getEntity(itemId);
		if (!itemEntity) return results;

		const item = itemEntity.get(Item);
		if (!item) return results;

		if (!item.use)
			results.push(
				new MessageResult(
					`The ${nameOf(itemEntity)} cannot be used.`,
					Colours.yellow
				)
			);
		else if (item.targeting) {
			engine.refresh();
			engine.gameStateStack.swap(GameState.Targeting);
			engine.targetingItem = itemEntity;

			results.push(item.targetingMessage!);
		} else {
			results.push(...item.use(itemEntity, entity, engine));
		}

		// TODO: this is such a bad hack, should be fixed when I get energy system
		if (results.find(r => r.name == 'consumeitem')) {
			if (engine.gameState == GameState.ShowInventory) {
				engine.refresh();
				engine.gameStateStack.pop();
			}

			engine.gameStateStack.swap(GameState.EnemyTurn);
		}

		return results;
	}
}
