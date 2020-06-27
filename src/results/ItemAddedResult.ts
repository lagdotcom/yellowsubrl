import Result from './Result';
import Engine from '../Engine';
import { HasInventory } from '../components/Inventory';
import { HasItem } from '../components/Item';

export default class ItemAddedResult implements Result {
	name: 'itemadded';
	constructor(public owner: HasInventory, public item: HasItem) {
		this.name = 'itemadded';
	}

	perform(engine: Engine): Result[] {
		this.owner.inventory.items.push(this.item);
		engine.entities.splice(engine.entities.indexOf(this.item), 1);
		return [];
	}
}
