import { Entity, Inventory, Position } from '../ecs';
import Result from './Result';

export default class ItemAddedResult implements Result {
	name: 'itemadded';
	constructor(public owner: Entity, public item: Entity) {
		this.name = 'itemadded';
	}

	perform(): Result[] {
		const inventory = this.owner.get(Inventory);
		if (!inventory) return [];

		this.item.remove(Position);
		inventory.items.push(this.item);
		return [];
	}
}
