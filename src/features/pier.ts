import VanishAction from '../actions/VanishAction';
import {
	AI,
	Appearance,
	Fighter,
	IAppearance,
	PierDoor,
	Position,
} from '../components';
import Direction, { getOffset } from '../Direction';
import ecs, { Entity } from '../ecs';
import BowlerHatEnemy from '../enemies/pier/BowlerHatEnemy';
import EggcupEnemy from '../enemies/pier/EggcupEnemy';
import Engine from '../Engine';
import RenderOrder from '../RenderOrder';
import { attack } from '../systems/combat';
import { getBlocker } from '../systems/entities';
import { distance } from '../systems/movement';
import Colours from '../Colours';
import { pointSum, atSamePosition } from '../XY';

const pierEnemies = [BowlerHatEnemy, EggcupEnemy];
const doors = ecs.query({ all: [PierDoor] });

export const pierDoorPrefab = ecs
	.prefab('feature.pier.door')
	.add(PierDoor, {})
	.add(Appearance, {
		name: 'door',
		tile: 'Door',
		tile2: 'Door2',
		colour: Colours.white,
		order: RenderOrder.Stairs,
	});

function open(app: IAppearance) {
	app.tile = 'DoorOpen';
	app.tile2 = 'DoorOpen2';
}

function close(app: IAppearance) {
	app.tile = 'Door';
	app.tile2 = 'Door2';
}

export interface PierDoorAIVars {
	directions: Direction[];
	cooldown: number;
	open?: boolean;
}
export function pierDoorThink(me: Entity, engine: Engine) {
	const app = me.get(Appearance);
	const pos = me.get(Position);
	const vars = me.get(AI).vars as PierDoorAIVars;

	vars.cooldown--;
	if (vars.cooldown <= 1 || vars.open) {
		open(app);
	} else {
		close(app);
	}

	vars.open = false;
	if (vars.cooldown > 0) return [];

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
	target?: string;
}
export function pierEnemyThink(me: Entity) {
	const pos = me.get(Position);
	const vars = me.get(AI).vars as PierEnemyAIVars;

	const offset = getOffset(vars.direction);
	const destination = pointSum(pos, offset);

	// are we entering a door?
	const exits = doors
		.get()
		.filter(e => atSamePosition(e.get(Position), destination));
	if (exits.length) {
		const door = exits[0];
		(door.get(AI).vars as PierDoorAIVars).open = true;

		const doora = door.get(Appearance);
		open(doora);

		return [new VanishAction(me)];
	}

	if (vars.target) {
		const target = ecs.getEntity(vars.target);
		if (target) {
			if (distance(pos, target.get(Position)) < 2) {
				return attack(me, target);
			}
		}

		// don't stay angry
		vars.target = undefined;
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
	return [];
}

export function pierEnemyHurt(me: Entity, attacker: Entity) {
	const vars = me.get(AI).vars as PierEnemyAIVars;
	vars.target = attacker.id;

	return [];
}
