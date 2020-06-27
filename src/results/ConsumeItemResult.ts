import Result from './Result';
import { HasInventory } from '../components/Inventory';
import { HasItem } from '../components/Item';

export default class ConsumeItemResult implements Result {
	name: 'consumeitem';
	constructor(private owner: HasInventory, private item: HasItem) {
		this.name = 'consumeitem';
	}

	perform(): Result[] {
		this.owner.inventory.removeItem(this.item);
		return [];
	}
}
