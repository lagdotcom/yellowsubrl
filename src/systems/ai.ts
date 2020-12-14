import Engine from '../Engine';
import Result from '../results/Result';
import { distance, moveAstar, moveTowards } from './movement';
import XY, { atSamePosition } from '../XY';
import { attack } from './combat';
import MessageResult from '../results/MessageResult';
import { nameOf } from './entities';
import Colours from '../Colours';
import { Entity } from '../ecs';
import {
	AI,
	Position,
	Fighter,
	IAI,
	AIRoutine,
	AIRoutineName,
} from '../components';
import { pierDoorThink, pierEnemyHurt, pierEnemyThink } from './pierAi';

interface BasicAIVars {
	goal?: XY;
}
export function basicThink(me: Entity, engine: Engine) {
	const results: Result[] = [];
	const vars = me.get(AI).vars as BasicAIVars;
	const target = engine.player;

	const position = me.get(Position);
	const targetpos = target.get(Position);
	if (!position || !targetpos) return results;

	if (vars.goal && atSamePosition(vars.goal, position)) vars.goal = undefined;

	const playerAt = target.get(Position);
	if (engine.fovMap.isInFov(position.x, position.y))
		vars.goal = { x: playerAt.x, y: playerAt.y };

	if (vars.goal) {
		if (distance(position, vars.goal) >= 2)
			moveAstar(me, target, engine.gameMap, vars.goal);
		else if (distance(position, playerAt) < 2) {
			const angry = me.get(Fighter);
			const enemy = target.get(Fighter);
			if (angry && enemy && enemy.hp > 0) results.push(...attack(me, target));
		}
	}

	return results;
}

interface ConfusedAIVars {
	duration: number;
	previous: IAI;
}
export function confusedThink(me: Entity, engine: Engine) {
	const results: Result[] = [];
	const vars = me.get(AI).vars as ConfusedAIVars;

	const position = me.get(Position);
	if (!position) return results;

	if (vars.duration) {
		const x = engine.rng.randint(0, 2) - 1 + position.x;
		const y = engine.rng.randint(0, 2) - 1 + position.y;

		if (x != position.x || y != position.y)
			moveTowards(me, { x, y }, engine.gameMap);

		vars.duration--;
	} else {
		me.add(AI, vars.previous);
		results.push(
			new MessageResult(`The ${nameOf(me)} is no longer confused!`, Colours.red)
		);
	}

	return results;
}

export const AIRoutines: { [name in AIRoutineName]: AIRoutine } = {
	basic: { think: basicThink },
	confused: { think: confusedThink },
	pierDoor: { think: pierDoorThink },
	pierEnemy: { think: pierEnemyThink, hurt: pierEnemyHurt },
};
