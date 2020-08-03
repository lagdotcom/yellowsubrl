import ecs, { Entity } from '../ecs';
import { Equipment, Equippable, Stat, Slot } from '../components';
import Result from '../results/Result';
import EquipItemResult from '../results/EquipItemResult';
import RemoveItemResult from '../results/RemoveItemResult';

export function getEquipmentBonus(entity: Entity, stat: Stat) {
	var total = 0;
	const equipment = entity.get(Equipment);

	if (equipment)
		for (const slot in equipment) {
			const itemId = equipment[slot as Slot];
			const item = ecs.getEntity(itemId!);

			if (item) {
				const quip = item.get(Equippable);
				const bonus = quip.stats[stat];

				if (bonus) total += bonus;
			}
		}

	return total;
}

export function isEquipped(entity: Entity, item: Entity) {
	const equipment = entity.get(Equipment);
	const quip = item.get(Equippable);
	if (!equipment || !quip) return false;

	return equipment[quip.slot] == item.id;
}

export function toggleEquip(entity: Entity, item: Entity) {
	const results: Result[] = [];

	const equipment = entity.get(Equipment);
	const quip = item.get(Equippable);
	if (!equipment || !quip) return results;

	const slot = quip.slot;
	if (equipment[slot] == item.id) {
		results.push(new RemoveItemResult(entity, item));
	} else {
		const itemId = equipment[slot];
		if (itemId) {
			const other = ecs.getEntity(itemId);
			if (other) results.push(new RemoveItemResult(entity, other));
		}

		results.push(new EquipItemResult(entity, item));
	}

	return results;
}
