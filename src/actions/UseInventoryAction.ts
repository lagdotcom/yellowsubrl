import Action from './Action';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import Result from '../results/Result';
import GameState from '../GameState';
import ecs, { Entity } from '../ecs';
import { nameOf } from '../systems/entities';
import { Inventory, Item, Equippable, Equipment } from '../components';
import { toggleEquip } from '../systems/equipment';
import { isAlive } from '../systems/combat';

export default class UseInventoryAction implements Action {
	name: 'useinventory';
	constructor(public slot: string) {
		this.name = 'useinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		if (!isAlive(entity)) return results;

		const inventory = entity.get(Inventory);
		if (!inventory) return results;

		const itemId = inventory.items[this.slot];
		if (!itemId) return results;

		const itemEntity = ecs.getEntity(itemId);
		if (!itemEntity) return results;

		const item = itemEntity.get(Item);
		if (!item) return results;

		if (!item.use) {
			const equipment = entity.get(Equipment);
			const quip = itemEntity.get(Equippable);
			if (equipment && quip) results.push(...toggleEquip(entity, itemEntity));
			else
				results.push(
					new MessageResult(
						`The ${nameOf(itemEntity)} cannot be used.`,
						Colours.yellow
					)
				);
		} else if (item.targeting) {
			engine.refresh();
			engine.gameStateStack.swap(GameState.Targeting);
			engine.targetingItem = itemEntity;

			results.push(item.targetingMessage!);
		} else {
			results.push(...item.use(itemEntity, entity, engine));
		}

		return results;
	}
}
