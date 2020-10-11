import VanishAction from '../actions/VanishAction';
import { AI, Appearance, Fighter, PierDoor, Position } from '../components';
import Direction, { getOffset } from '../Direction';
import ecs, { Entity } from '../ecs';
import { bowlerHat } from '../enemies/pier';
import Engine from '../Engine';
import { RenderOrder } from '../renderFunctions';
import { attack } from '../systems/combat';
import { getBlocker } from '../systems/entities';
import { Colours } from '../tcod';
import { pointSum, atSamePosition } from '../XY';

const pierEnemies = [bowlerHat];
const doors = ecs.query({ all: [PierDoor] });

export const pierDoorPrefab = ecs
	.prefab('pierdoor')
	.add(PierDoor, {})
	.add(Appearance, {
		name: 'door',
		tile: 'Door',
		tile2: 'Door2',
		colour: Colours.white,
		order: RenderOrder.Stairs,
	});

export interface PierDoorAIVars {
	directions: Direction[];
	cooldown: number;
}
export function pierDoorAI(me: Entity, target: Entity, engine: Engine) {
	const pos = me.get(Position);
	const vars = me.get(AI).vars as PierDoorAIVars;

	if (vars.cooldown > 0) {
		vars.cooldown--;
		return [];
	}

	const direction = engine.rng.choose(vars.directions);
	const offset = getOffset(direction);
	const destination = pointSum(pos, offset);
	if (getBlocker(destination.x, destination.y)) return [];

	const prefab = engine.rng.choose(pierEnemies);
	const enemy = ecs.entity(prefab).add(Position, destination);
	const aiVars = enemy.get(AI).vars as PierEnemyAIVars;
	aiVars.direction = direction;

	vars.cooldown = engine.rng.randint(100, 200);
	return [];
}

export interface PierEnemyAIVars {
	direction: Direction;
	angry: boolean;
}
export function pierEnemyAI(me: Entity, target: Entity, engine: Engine) {
	const pos = me.get(Position);
	const vars = me.get(AI).vars as PierEnemyAIVars;

	const offset = getOffset(vars.direction);
	const destination = pointSum(pos, offset);

	// are we entering a door?
	const exits = doors
		.get()
		.filter(e => atSamePosition(e.get(Position), destination));
	if (exits.length) {
		return [new VanishAction(me)];
	}

	const blocker = getBlocker(destination.x, destination.y);
	if (blocker) {
		const ai = blocker.get(AI);
		if (ai && ai.routine === 'pierEnemy') {
			// swap positions
			const other = blocker.get(Position);
			other.x = pos.x;
			other.y = pos.y;

			pos.x = destination.x;
			pos.y = destination.y;
			return [];
		}

		const fighter = blocker.get(Fighter);
		if (fighter) {
			return attack(me, blocker);
		}

		// what do
		return [];
	}

	pos.x = destination.x;
	pos.y = destination.y;

	// TODO
	return [];
}
