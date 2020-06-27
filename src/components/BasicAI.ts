import Entity from '../Entity';
import { Map } from '../tcod';
import GameMap from '../GameMap';
import Location, { HasLocation } from './Location';
import { HasFighter } from './Fighter';

export default class BasicAI {
	goal?: Location;

	constructor() {}

	takeTurn(
		me: HasLocation,
		target: HasLocation & HasFighter,
		fovMap: Map,
		gameMap: GameMap,
		entities: Entity[]
	) {
		const results = [];

		if (
			this.goal &&
			this.goal.x == me.location.x &&
			this.goal.y == me.location.y
		)
			this.goal = undefined;

		if (fovMap.isInFov(me.location.x, me.location.y))
			this.goal = new Location(target.location.x, target.location.y, false);

		if (this.goal) {
			if (me.location.distanceTo(target.location) >= 2)
				me.location.moveAstar(me, target, gameMap, entities, this.goal);
			else if (me.fighter && target.fighter.hp > 0)
				results.push(...me.fighter.attack(me as HasFighter, target));
		}

		return results;
	}
}
