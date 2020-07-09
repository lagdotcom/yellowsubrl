import { Entity } from '../ecs';
import Result from '../results/Result';
import MessageResult from '../results/MessageResult';
import DeadResult from '../results/DeadResult';
import { nameOf } from './entities';
import { Fighter } from '../components';

export function addHp(entity: Entity, amount: number) {
	const fighter = entity.get(Fighter);
	if (fighter) {
		fighter.hp += amount;
		if (fighter.hp > fighter.maxHp) fighter.hp = fighter.maxHp;
	}
}

export function attack(attacker: Entity, victim: Entity) {
	const results: Result[] = [];

	const me = attacker.get(Fighter);
	const you = victim.get(Fighter);
	if (!me || !you) return results;

	const myName = nameOf(attacker);
	const yourName = nameOf(victim);

	const damage = me.power - you.defense;

	if (damage > 0) {
		results.push(
			new MessageResult(
				`${myName} attacks ${yourName} for ${damage} hit points.`
			)
		);
		results.push(...takeDamage(victim, damage));
	} else {
		results.push(
			new MessageResult(`${myName} attacks ${yourName} but does no damage.`)
		);
	}

	return results;
}

export function takeDamage(entity: Entity, amount: number) {
	const results: Result[] = [];

	const fighter = entity.get(Fighter);
	if (!fighter) return results;

	fighter.hp -= amount;
	if (fighter.hp <= 0) results.push(new DeadResult(entity));

	return results;
}
