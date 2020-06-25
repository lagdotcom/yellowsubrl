import Entity from '../Entity';
import { Map } from '../tcod';
import GameMap from '../GameMap';
import { HasLocation } from './Location';
import { HasFighter } from './Fighter';

export default class BasicAI {
	takeTurn(
		me: HasLocation,
		target: HasLocation & HasFighter,
		fovMap: Map,
		gameMap: GameMap,
		entities: Entity[]
	) {
		const results = [];

		if (fovMap.isInFov(me.location.x, me.location.y)) {
			if (me.location.distanceTo(target.location) >= 2)
				me.location.moveAstar(me, target, gameMap, entities);
			else if (me.fighter && target.fighter.hp > 0)
				results.push(...me.fighter.attack(me as HasFighter, target));
		}

		return results;
	}
}
