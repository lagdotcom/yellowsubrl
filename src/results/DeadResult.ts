import Entity from '../Entity';
import Result from './Result';
import Engine from '../Engine';
import { Colours } from '../tcod';
import MessageResult from './MessageResult';
import GameState from '../GameState';
import { RenderOrder } from '../renderFunctions';

export default class DeadResult implements Result {
	constructor(public entity: Entity) {}

	perform(engine: Engine): Result[] {
		const { entity } = this;
		const results = [];

		entity.appearance!.ch = '%';
		entity.appearance!.colour = Colours.darkRed;

		// TODO
		if (entity.name === 'Player') {
			engine.gameState = GameState.PlayerDead;
			results.push(new MessageResult('You died!', Colours.red));
		} else {
			results.push(
				new MessageResult(`${entity.name} is dead!`, Colours.orange)
			);
			entity.appearance!.order = RenderOrder.Corpse;
			entity.location!.blocks = false;
			entity.fighter = undefined;
			entity.ai = undefined;
			entity.name = `remains of ${entity.name}`;
		}

		return results;
	}
}
