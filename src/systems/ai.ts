import { Entity, Position, Fighter, AI } from '../ecs';
import IAI, { AIRoutine } from '../components/AI';
import Engine from '../Engine';
import Result from '../results/Result';
import { XY, distance, moveAstar, moveTowards } from './movement';
import { attack } from './combat';
import MessageResult from '../results/MessageResult';
import { nameOf } from './entities';
import { Colours } from '../tcod';

export class BasicAI implements AIRoutine {
	goal?: XY;

	perform(me: Entity, target: Entity, engine: Engine) {
		const results: Result[] = [];

		const position = me.get(Position);
		const targetpos = target.get(Position);
		if (!position || !targetpos) return results;

		if (this.goal && this.goal.x == position.x && this.goal.y == position.y)
			this.goal = undefined;

		const playerAt = target.get(Position);
		if (engine.fovMap.isInFov(position.x, position.y))
			this.goal = { x: playerAt.x, y: playerAt.y };

		if (this.goal) {
			if (distance(position, this.goal) >= 2)
				moveAstar(me, target, engine.gameMap, this.goal);
			else if (distance(position, playerAt) < 2) {
				const angry = me.get(Fighter);
				const enemy = target.get(Fighter);
				if (angry && enemy && enemy.hp > 0) results.push(...attack(me, target));
			}
		}

		return results;
	}
}

export default class ConfusedAI implements AIRoutine {
	constructor(private previous: IAI, private duration: number) {}

	perform(me: Entity, target: Entity, engine: Engine) {
		const results: Result[] = [];

		const position = me.get(Position);
		if (!position) return results;

		if (this.duration) {
			const x = engine.rng.randint(0, 2) - 1 + position.x;
			const y = engine.rng.randint(0, 2) - 1 + position.y;

			if (x != position.x || y != position.y)
				moveTowards(me, { x, y }, engine.gameMap);

			this.duration--;
		} else {
			me.add(AI, this.previous);
			results.push(
				new MessageResult(
					`The ${nameOf(me)} is no longer confused!`,
					Colours.red
				)
			);
		}

		return results;
	}
}
