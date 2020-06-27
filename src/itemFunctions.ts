import Entity from './Entity';
import MessageResult from './results/MessageResult';
import { Colours } from './tcod';
import { HasFighter } from './components/Fighter';
import Result from './results/Result';
import { HasInventory } from './components/Inventory';
import ConsumeItemResult from './results/ConsumeItemResult';
import { HasItem } from './components/Item';

export function heal(item: HasItem, en: Entity, amount: number) {
	const results: Result[] = [];
	if (!en.fighter) return results;

	if (en.fighter.hp >= en.fighter.maxHp)
		results.push(
			new MessageResult('You are already at full health.', Colours.yellow)
		);
	else {
		en.fighter.heal(en as HasFighter, amount);
		results.push(
			new ConsumeItemResult(en as HasInventory, item),
			new MessageResult('Your wounds start to feel better!', Colours.green)
		);
	}

	return results;
}
