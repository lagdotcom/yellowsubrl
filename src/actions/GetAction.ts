import Action from './Action';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import Result from '../results/Result';
import GameState from '../GameState';
import ecs, { Inventory, Position, Entity, Item } from '../ecs';
import { addItemToInventory } from '../systems/items';

export default class GetAction implements Action {
	name: 'get';
	constructor() {
		this.name = 'get';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];

		const inventory = entity.get(Inventory),
			position = entity.get(Position);

		if (!inventory || !position) return results;

		const items = ecs.find({ all: [Item, Position] }).filter(en => {
			const pos = en.get(Position);
			return pos.x == position.x && pos.y == position.y;
		});

		if (items.length == 0) {
			results.push(
				new MessageResult('There is nothing to pick up.', Colours.yellow)
			);
		} else {
			items.forEach(it => {
				results.push(...addItemToInventory(it, entity));
			});

			engine.gameStateStack.swap(GameState.EnemyTurn);
		}

		return results;
	}
}
