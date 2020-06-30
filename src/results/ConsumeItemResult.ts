import Result from './Result';
import ecs, { Entity, Inventory } from '../ecs';

export default class ConsumeItemResult implements Result {
	name: 'consumeitem';
	constructor(private owner: Entity, private item: Entity) {
		this.name = 'consumeitem';
	}

	perform(): Result[] {
		const inventory = this.owner.get(Inventory);
		if (!inventory) return [];

		ecs.remove(this.item);

		const index = inventory.items.indexOf(this.item);
		if (index >= 0) inventory.items.splice(index, 1);
		return [];
	}
}
