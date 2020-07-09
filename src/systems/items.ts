import { Entity } from '../ecs';
import { Colours } from '../tcod';
import { nameOf } from './entities';
import ItemAddedResult from '../results/ItemAddedResult';
import Result from '../results/Result';
import MessageResult from '../results/MessageResult';
import { Inventory, Position } from '../components';

export function addItemToInventory(item: Entity, owner: Entity) {
	const results: Result[] = [];

	const inventory = owner.get(Inventory);
	if (!inventory) return results;

	if (inventory.capacity <= inventory.items.length) {
		results.push(
			new MessageResult(
				'You cannot carry any more, your inventory is full.',
				Colours.yellow
			)
		);
	} else {
		item.remove(Position);
		results.push(
			new ItemAddedResult(owner, item),
			new MessageResult(`You pick up the ${nameOf(item)}!`, Colours.blue)
		);
	}

	return results;
}

export function dropItemFromInventory(item: Entity, owner: Entity) {
	const results: Result[] = [];

	const inventory = owner.get(Inventory);
	if (!inventory) return results;

	const index = inventory.items.indexOf(item);
	if (index >= 0) inventory.items.splice(index, 1);

	results.push(
		new MessageResult(`You drop the ${nameOf(item)}.`, Colours.yellow)
	);

	return results;
}
