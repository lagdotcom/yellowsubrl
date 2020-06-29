import Entity from './Entity';
import MessageResult from './results/MessageResult';
import { Colours } from './tcod';
import { HasFighter } from './components/Fighter';
import Result from './results/Result';
import { HasInventory } from './components/Inventory';
import ConsumeItemResult from './results/ConsumeItemResult';
import { HasItem } from './components/Item';
import { Map } from './libtcod/Map';
import ConfusedAI from './components/ConfusedAI';

export function heal({
	item,
	en,
	amount,
}: {
	item: HasItem;
	en: Entity;
	amount: number;
}) {
	const results: Result[] = [];
	if (!en.fighter) return results;

	if (en.fighter.hp >= en.fighter.maxHp)
		results.push(
			new MessageResult('You are already at full health.', Colours.yellow)
		);
	else {
		en.fighter.heal(en as HasFighter, amount);
		results.push(
			new ConsumeItemResult(en as HasInventory, item),
			new MessageResult('Your wounds start to feel better!', Colours.green)
		);
	}

	return results;
}

export function castLightning({
	item,
	caster,
	entities,
	fovMap,
	damage,
	range,
}: {
	item: HasItem;
	caster: Entity;
	entities: Entity[];
	fovMap: Map;
	damage: number;
	range: number;
}) {
	const results: Result[] = [];
	if (!caster.location) return results;

	var target: Entity | undefined = undefined;
	var closest = range + 1;
	for (var i = 0; i < entities.length; i++) {
		const en = entities[i];
		if (
			en.fighter &&
			en.location &&
			en != caster &&
			fovMap.isInFov(en.location.x, en.location.y)
		) {
			const distance = caster.location!.distanceTo(en.location);
			if (distance < closest) {
				closest = distance;
				target = en;
			}
		}
	}

	if (target) {
		results.push(
			new MessageResult(
				`A lightning bolt strikes the ${target.name} with a loud thunder! The damage is ${damage}.`,
				Colours.cyan
			),
			...target.fighter!.takeDamage(target as HasFighter, damage),
			new ConsumeItemResult(caster as HasInventory, item)
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
	entities,
	fovMap,
	damage,
	radius,
	targetX,
	targetY,
}: {
	item: HasItem;
	caster: Entity;
	entities: Entity[];
	fovMap: Map;
	damage: number;
	radius: number;
	targetX: number;
	targetY: number;
}) {
	const results: Result[] = [];

	if (!fovMap.isInFov(targetX, targetY)) {
		results.push(
			new MessageResult(
				'You cannot target a tile outside your field of view.',
				Colours.yellow
			)
		);
		return results;
	}

	results.push(
		new ConsumeItemResult(caster as HasInventory, item),
		new MessageResult(
			`The fireball explodes, burning everything within ${radius} tiles!`,
			Colours.orange
		)
	);

	entities
		.filter(
			en =>
				en.fighter &&
				en.location &&
				en.location.distance(targetX, targetY) <= radius
		)
		.forEach(en => {
			results.push(
				new MessageResult(
					`The ${en.name} gets burned for ${damage} hit points.`
				),
				...en.fighter!.takeDamage(en as HasFighter, damage)
			);
		});

	return results;
}

export function castConfuse(
	item: HasItem,
	caster: Entity,
	entities: Entity[],
	fovMap: Map,
	duration: number,
	targetX: number,
	targetY: number
) {
	const results: Result[] = [];

	if (!fovMap.isInFov(targetX, targetY)) {
		results.push(
			new MessageResult(
				'You cannot target a tile outside your field of view.',
				Colours.yellow
			)
		);
		return results;
	}

	for (var i = 0; i < entities.length; i++) {
		const en = entities[i];

		if (
			en.ai &&
			en.location &&
			en.location.x == targetX &&
			en.location.y == targetY
		) {
			en.ai = new ConfusedAI(en.ai, duration);
			results.push(
				new ConsumeItemResult(caster as HasInventory, item),
				new MessageResult(
					`The eyes of the ${en.name} look vacant, as he starts to stumble around!`,
					Colours.lightGreen
				)
			);

			return results;
		}
	}

	results.push(
		new MessageResult(
			'There is no targetable enemy at that location.',
			Colours.yellow
		)
	);
	return results;
}
