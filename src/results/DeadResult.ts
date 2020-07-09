import Result from './Result';
import Engine from '../Engine';
import { Colours } from '../tcod';
import MessageResult from './MessageResult';
import GameState from '../GameState';
import { RenderOrder } from '../renderFunctions';
import { Entity } from '../ecs';
import { nameOf } from '../systems/entities';
import { Appearance, Player, AI, Blocks, Fighter } from '../components';

export default class DeadResult implements Result {
	name: 'dead';
	constructor(public entity: Entity) {
		this.name = 'dead';
	}

	perform(engine: Engine): Result[] {
		const { entity } = this;
		const results = [];

		const name = nameOf(entity);

		// TODO: this should probably just make a new entity haha
		entity.add(Appearance, {
			name: `remains of ${name}`,
			tile: '%',
			colour: Colours.darkRed,
			order: RenderOrder.Corpse,
		});

		if (entity.has(Player)) {
			engine.gameStateStack.swap(GameState.PlayerDead);
			results.push(new MessageResult('You died!', Colours.red));
		} else {
			results.push(new MessageResult(`${name} is dead!`, Colours.orange));

			entity.remove(AI);
			entity.remove(Blocks);
			entity.remove(Fighter);
		}

		return results;
	}
}
