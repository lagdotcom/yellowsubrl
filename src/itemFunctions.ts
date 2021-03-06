import ecs, { Entity } from './ecs';
import Result from './results/Result';
import { addHp, takeDamage } from './systems/combat';
import MessageResult from './results/MessageResult';
import Colours from './Colours';
import TileMap from './lib/TileMap';
import ConsumeItemResult from './results/ConsumeItemResult';
import { distance } from './systems/movement';
import XY from './XY';
import { nameOf, isAt } from './systems/entities';
import { Fighter, Position, AI } from './components';
import { getStat } from './systems/stats';

export function heal({
	item,
	en,
	amount,
}: {
	item: Entity;
	en: Entity;
	amount: number;
}) {
	const results: Result[] = [];
	const fighter = en.get(Fighter);
	if (!fighter) return results;

	if (fighter.hp >= getStat(en, 'maxHp'))
		results.push(
			new MessageResult('You are already at full health.', Colours.yellow)
		);
	else {
		addHp(en, amount);
		results.push(
			new ConsumeItemResult(en, item),
			new MessageResult('Your wounds start to feel better!', Colours.green)
		);
	}

	return results;
}

export function castLightning({
	item,
	caster,
	fovMap,
	damage,
	range,
}: {
	item: Entity;
	caster: Entity;
	fovMap: TileMap;
	damage: number;
	range: number;
}) {
	const results: Result[] = [];
	const position = caster.get(Position);
	if (!position) return results;

	var target: Entity | undefined = undefined;
	var closest = range + 1;
	const entities = ecs.find({ all: [Fighter, Position] });
	for (var i = 0; i < entities.length; i++) {
		const en = entities[i];
		const at = en.get(Position);
		if (en != caster && fovMap.isInFov(at.x, at.y)) {
			const dist = distance(position, at);
			if (dist < closest) {
				closest = dist;
				target = en;
			}
		}
	}

	if (target) {
		results.push(
			new MessageResult(
				`A lightning bolt strikes the ${nameOf(
					target
				)} with a loud thunder! The damage is ${damage}.`,
				Colours.cyan
			),
			...takeDamage(target, damage, caster),
			new ConsumeItemResult(caster, item)
		);
	} else {
		results.push(
			new MessageResult('No enemy is close enough to strike.', Colours.red)
		);
	}

	return results;
}

export function castFireball({
	item,
	caster,
	fovMap,
	damage,
	radius,
	target,
}: {
	item: Entity;
	caster: Entity;
	fovMap: TileMap;
	damage: number;
	radius: number;
	target: XY;
}) {
	const results: Result[] = [];

	if (!fovMap.isInFov(target.x, target.y)) {
		results.push(
			new MessageResult(
				'You cannot target a tile outside your field of view.',
				Colours.yellow
			)
		);
		return results;
	}

	results.push(
		new ConsumeItemResult(caster, item),
		new MessageResult(
			`The fireball explodes, burning everything within ${radius} tiles!`,
			Colours.orange
		)
	);

	ecs.find({ all: [Fighter, Position] }).forEach(en => {
		if (distance(target, en.get(Position)) <= radius) {
			results.push(
				new MessageResult(
					`The ${nameOf(en)} gets burned for ${damage} hit points.`
				),
				...takeDamage(en, damage, caster)
			);
		}
	});

	return results;
}

function confuse(victim: Entity, duration: number) {
	victim.add(AI, {
		routine: 'confused',
		vars: { duration, previous: victim.get(AI) },
	});
}

export function castConfuse(
	item: Entity,
	caster: Entity,
	fovMap: TileMap,
	duration: number,
	target: XY
) {
	const results: Result[] = [];

	if (!fovMap.isInFov(target.x, target.y)) {
		results.push(
			new MessageResult(
				'You cannot target a tile outside your field of view.',
				Colours.yellow
			)
		);
		return results;
	}

	const victim = ecs
		.find({ all: [AI, Position] })
		.find(en => isAt(en, target.x, target.y));
	if (victim) {
		confuse(victim, duration);
		results.push(
			new ConsumeItemResult(caster, item),
			new MessageResult(
				`The eyes of the ${nameOf(
					victim
				)} look vacant, as he starts to stumble around!`,
				Colours.lightGreen
			)
		);
	} else
		results.push(
			new MessageResult(
				'There is no targetable enemy at that location.',
				Colours.yellow
			)
		);

	return results;
}
