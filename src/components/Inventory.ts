import Entity from '../Entity';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import { HasItem } from './Item';
import ItemAddedResult from '../results/ItemAddedResult';
import PlaceItemResult from '../results/PlaceItemResult';
import { HasLocation } from './Location';

export type HasInventory = Entity & { inventory: Inventory };

export default class Inventory {
	items: HasItem[];

	constructor(public capacity: number) {
		this.items = [];
	}

	addItem(en: HasInventory, item: HasItem) {
		const results = [];

		if (this.items.length >= this.capacity) {
			results.push(
				new MessageResult(
					'You cannot carry any more, your inventory is full.',
					Colours.yellow
				)
			);
		} else {
			results.push(
				new ItemAddedResult(en, item),
				new MessageResult(`You pick up the ${item.name}!`, Colours.blue)
			);
		}

		return results;
	}

	removeItem(item: HasItem) {
		if (!this.items.includes(item)) return false;

		this.items.splice(this.items.indexOf(item), 1);
		return true;
	}

	dropItem(owner: HasInventory, item: HasItem) {
		const results = [];

		if (this.removeItem(item)) {
			if (owner.location)
				results.push(
					new PlaceItemResult(owner as HasInventory & HasLocation, item),
					new MessageResult(`You drop the ${item.name}.`, Colours.yellow)
				);
		}

		return results;
	}
}
