import Result from './Result';
import Engine from '../Engine';
import { Entity } from '../ecs';
import { addXp } from '../systems/experience';
import MessageResult from './MessageResult';
import { Colours } from '../tcod';
import { Level } from '../components';
import GameState from '../GameState';

export default class XpResult implements Result {
	constructor(public entity: Entity, public xp: number) {}

	perform(engine: Engine): Result[] {
		const { entity, xp } = this;
		const raise = addXp(entity, xp);

		const results = [
			new MessageResult(`You gain ${xp} experience points.`, Colours.white),
		];
		if (raise) {
			results.push(
				new MessageResult(
					`Your battle skills grow stronger! You reached level ${
						entity.get(Level).currentLevel
					}!`,
					Colours.yellow
				)
			);

			engine.gameStateStack.push(GameState.LevelUp);
		}

		return results;
	}
}
