import ecs, { Entity } from '../ecs';
import { dropItemFromInventory } from '../systems/items';
import Action from './Action';
import Engine from '../Engine';
import Result from '../results/Result';
import PlaceItemResult from '../results/PlaceItemResult';
import { Inventory } from '../components';
import { isEquipped, toggleEquip } from '../systems/equipment';
import CloseInventoryResult from '../results/CloseInventoryResult';
import ConsumeTurnResult from '../results/ConsumeTurnResult';
import { isAlive } from '../systems/combat';

export default class DropInventoryAction implements Action {
	constructor(public slot: string) {}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		if (!isAlive(entity)) return results;

		const inventory = entity.get(Inventory);
		if (!inventory) return results;

		const itemId = inventory.items[this.slot];
		if (!itemId) return results;

		const itemEntity = ecs.getEntity(itemId);
		if (!itemEntity) return results;

		if (isEquipped(entity, itemEntity))
			results.push(...toggleEquip(entity, itemEntity));

		results.push(
			...dropItemFromInventory(itemEntity, entity),
			new PlaceItemResult(entity, itemEntity),
			new CloseInventoryResult(),
			new ConsumeTurnResult()
		);

		return results;
	}
}
