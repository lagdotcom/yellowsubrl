import AI from './AI';
import Entity from '../Entity';
import Result from '../results/Result';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import { Colours } from '../tcod';

export default class ConfusedAI implements AI {
	constructor(private previous: AI, private duration: number) {}

	takeTurn(me: Entity, target: Entity, engine: Engine) {
		const results: Result[] = [];
		if (!me.location) return results;

		if (this.duration) {
			const rx = engine.rng.randint(0, 2) - 1 + me.location.x;
			const ry = engine.rng.randint(0, 2) - 1 + me.location.y;

			if (rx != me.location.x || ry != me.location.y)
				me.location.moveTowards(rx, ry, engine.gameMap, engine.entities);

			this.duration--;
		} else {
			me.ai = this.previous;
			results.push(
				new MessageResult(`The ${me.name} is no longer confused!`, Colours.red)
			);
		}

		return results;
	}
}
