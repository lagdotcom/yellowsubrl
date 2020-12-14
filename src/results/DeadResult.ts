import Result from './Result';
import Engine from '../Engine';
import Colours from '../Colours';
import MessageResult from './MessageResult';
import GameState from '../GameState';
import ecs, { Entity } from '../ecs';
import { nameOf } from '../systems/entities';
import { Player, Fighter, Drops, Position } from '../components';
import XpResult from './XpResult';

export default class DeadResult implements Result {
	constructor(public entity: Entity) {}

	perform(engine: Engine): Result[] {
		const { entity } = this;
		const results = [];

		const name = nameOf(entity);
		const at = entity.get(Position);

		const drops = entity.get(Drops);
		if (drops) {
			drops.entries.forEach(entry => {
				if (engine.rng.randint(1, 100) <= entry.chance) {
					const prefab = engine.rng.weighted(entry.table);
					ecs.entity(prefab).add(Position, { x: at.x, y: at.y });
				}
			});
		}

		if (entity.has(Player)) {
			engine.gameStateStack.swap(GameState.PlayerDead);
			results.push(new MessageResult('You died!', Colours.red));
		} else {
			const fighter = entity.get(Fighter);

			results.push(new MessageResult(`${name} is dead!`, Colours.orange));
			if (fighter) results.push(new XpResult(engine.player, fighter.xp));

			entity.destroy();
		}

		return results;
	}
}
