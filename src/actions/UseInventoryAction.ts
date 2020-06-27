import Action from './Action';
import Engine from '../Engine';
import Entity from '../Entity';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import Result from '../results/Result';
import GameState from '../GameState';

export default class UseInventoryAction implements Action {
	name: 'useinventory';
	constructor(public index: number) {
		this.name = 'useinventory';
	}

	perform(engine: Engine, entity: Entity) {
		const results: Result[] = [];
		if (!entity.inventory) return results;

		const item = entity.inventory.items[this.index];
		if (!item) return results;

		if (!item.item.use)
			results.push(
				new MessageResult(`The ${item.name} cannot be used.`, Colours.yellow)
			);
		else {
			results.push(...item.item.use(item, entity));
		}

		// TODO: this is such a bad hack, should be fixed when I get energy system
		if (results.find(r => r.name == 'consumeitem')) {
			if (engine.gameState == GameState.ShowInventory) {
				engine.refresh();
				engine.gameStateStack.pop();
			}

			engine.gameStateStack.swap(GameState.EnemyTurn);
		}

		return results;
	}
}
