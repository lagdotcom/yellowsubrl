import { Entity } from '../ecs';
import Result from './Result';
import { Inventory, Position } from '../components';

export default class ItemAddedResult implements Result {
	name: 'itemadded';
	constructor(public owner: Entity, public item: Entity, public slot: string) {
		this.name = 'itemadded';
	}

	perform(): Result[] {
		const inventory = this.owner.get(Inventory);
		if (!inventory) return [];

		this.item.remove(Position);
		inventory.items[this.slot] = this.item.id;
		return [];
	}
}
