import ecs, { Entity } from '../ecs';
import Colours from '../Colours';
import { iconOf, nameOf } from './entities';
import ItemAddedResult from '../results/ItemAddedResult';
import Result from '../results/Result';
import MessageResult from '../results/MessageResult';
import { Inventory, Position, Equipment } from '../components';

const slots = 'abcdefghijklmnopqrstuvwxyz';

export function hasEmptyInventory(owner: Entity) {
	const inventory = owner.get(Inventory);
	if (!inventory) return false;

	return Object.keys(inventory.items).length == 0;
}

export function getFreeInventorySlot(owner: Entity) {
	const inventory = owner.get(Inventory);
	if (!inventory) return undefined;

	for (var i = 0; i < slots.length; i++) {
		const ch = slots[i];
		if (!inventory.items[ch]) return ch;
	}
}

export function findItemInInventory(owner: Entity, id: string) {
	const inventory = owner.get(Inventory);
	if (!inventory) return undefined;

	for (var i = 0; i < slots.length; i++) {
		const ch = slots[i];
		if (inventory.items[ch] == id) return ch;
	}
}

export function getInventoryMenu(owner: Entity) {
	const inventory = owner.get(Inventory);
	if (!inventory || hasEmptyInventory(owner))
		return { '-': 'Inventory is empty.' };

	const equipment = owner.get(Equipment);
	const menu: { [slot: string]: string } = {};
	for (var slot in inventory.items) {
		const item = ecs.getEntity(inventory.items[slot]);
		if (item) {
			var entry = iconOf(item) + nameOf(item);
			if (equipment.main === item.id) entry += ' (in main hand)';
			else if (equipment.offhand === item.id) entry += ' (in off hand)';
			else if (equipment.head === item.id) entry += ' (on head)';

			menu[slot] = entry;
		}
	}

	return menu;
}

export function addItemToInventory(item: Entity, owner: Entity) {
	const results: Result[] = [];

	const inventory = owner.get(Inventory);
	if (!inventory) return results;

	const slot = getFreeInventorySlot(owner);
	if (!slot) {
		results.push(
			new MessageResult(
				'You cannot carry any more, your inventory is full.',
				Colours.yellow
			)
		);
	} else {
		item.remove(Position);
		results.push(
			new ItemAddedResult(owner, item, slot),
			new MessageResult(`You pick up the ${nameOf(item)}!`, Colours.blue)
		);
	}

	return results;
}

export function dropItemFromInventory(item: Entity, owner: Entity) {
	const results: Result[] = [];

	const inventory = owner.get(Inventory);
	if (!inventory) return results;

	const slot = findItemInInventory(owner, item.id);
	if (slot) {
		delete inventory.items[slot];

		results.push(
			new MessageResult(`You drop the ${nameOf(item)}.`, Colours.yellow)
		);
	}

	return results;
}
