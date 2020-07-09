import Result from './Result';
import ecs, { Entity } from '../ecs';
import { Inventory } from '../components';
import { findItemInInventory } from '../systems/items';

export default class ConsumeItemResult implements Result {
	name: 'consumeitem';
	constructor(private owner: Entity, private item: Entity) {
		this.name = 'consumeitem';
	}

	perform(): Result[] {
		const inventory = this.owner.get(Inventory);
		if (!inventory) return [];

		ecs.remove(this.item);

		const slot = findItemInInventory(this.owner, this.item.id);
		if (slot) delete inventory.items[slot];

		return [];
	}
}
