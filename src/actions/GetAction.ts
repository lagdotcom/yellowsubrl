import Action from './Action';
import Engine from '../Engine';
import Entity from '../Entity';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import Result from '../results/Result';
import { HasInventory } from '../components/Inventory';
import { HasItem } from '../components/Item';
import GameState from '../GameState';

export default class GetAction implements Action {
	name: 'get';
	constructor() {
		this.name = 'get';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];
		if (!entity.inventory || !entity.location) return results;

		const items = engine.entities.filter(
			en =>
				en.location &&
				en.item &&
				en.location.x == entity.location!.x &&
				en.location.y == entity.location!.y
		);

		if (items.length == 0) {
			results.push(
				new MessageResult('There is nothing to pick up.', Colours.yellow)
			);
		} else {
			items.forEach(it => {
				results.push(
					...entity.inventory!.addItem(entity as HasInventory, it as HasItem)
				);
			});

			engine.gameStateStack.swap(GameState.EnemyTurn);
		}

		return results;
	}
}
