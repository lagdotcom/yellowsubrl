import Action from './Action';
import Engine from '../Engine';
import ecs, { Entity } from '../ecs';
import Result from '../results/Result';
import { Stairs, Position, Fighter } from '../components';
import { isAt } from '../systems/entities';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';
import { addHp } from '../systems/combat';

export default class TakeStairsAction implements Action {
	name: string;
	constructor() {
		this.name = 'takestairs';
	}

	perform(engine: Engine, entity: Entity): Result[] {
		const pos = entity.get(Position);
		if (!pos) return [];

		const stairs = ecs
			.query({ all: [Position, Stairs] })
			.get()
			.find(e => isAt(e, pos.x, pos.y));
		if (!stairs)
			return [new MessageResult('There are no stairs here.', Colours.yellow)];

		engine.gameMap.floor++;
		engine.newMap();

		const fighter = entity.get(Fighter);
		if (fighter) {
			addHp(entity, Math.floor(fighter.maxHp / 2));
			return [
				new MessageResult(
					'You take a moment to rest, and recover your strength.',
					Colours.lightViolet
				),
			];
		}

		return [];
	}
}
