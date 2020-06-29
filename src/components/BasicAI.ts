import AI from './AI';
import Location, { HasLocation } from './Location';
import { HasFighter } from './Fighter';
import Engine from '../Engine';

export default class BasicAI implements AI {
	goal?: Location;

	constructor() {}

	takeTurn(me: HasLocation, target: HasLocation & HasFighter, engine: Engine) {
		const results = [];

		if (
			this.goal &&
			this.goal.x == me.location.x &&
			this.goal.y == me.location.y
		)
			this.goal = undefined;

		if (engine.fovMap.isInFov(me.location.x, me.location.y))
			this.goal = new Location(target.location.x, target.location.y, false);

		if (this.goal) {
			if (me.location.distanceTo(target.location) >= 2)
				me.location.moveAstar(
					me,
					target,
					engine.gameMap,
					engine.entities,
					this.goal
				);
			else if (me.fighter && target.fighter.hp > 0)
				results.push(...me.fighter.attack(me as HasFighter, target));
		}

		return results;
	}
}
