import Result from './Result';
import ecs, { Entity } from '../ecs';
import { Inventory } from '../components';
import { findItemInInventory } from '../systems/items';
import CloseInventoryResult from './CloseInventoryResult';
import ConsumeTurnResult from './ConsumeTurnResult';

export default class ConsumeItemResult implements Result {
	constructor(private owner: Entity, private item: Entity) {}

	perform(): Result[] {
		const inventory = this.owner.get(Inventory);
		if (!inventory) return [];

		ecs.remove(this.item);

		const slot = findItemInInventory(this.owner, this.item.id);
		if (slot) delete inventory.items[slot];

		return [new CloseInventoryResult(), new ConsumeTurnResult()];
	}
}
