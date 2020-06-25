import Entity from '../Entity';
import DeadResult from '../results/DeadResult';
import MessageResult from '../results/MessageResult';

export type HasFighter = Entity & { fighter: Fighter };

export default class Fighter {
	maxHp: number;

	constructor(public hp: number, public defense: number, public power: number) {
		this.maxHp = hp;
	}

	takeDamage(me: HasFighter, amount: number) {
		const results = [];
		this.hp -= amount;

		if (this.hp <= 0) results.push(new DeadResult(me));

		return results;
	}

	attack(me: HasFighter, target: HasFighter) {
		const results = [];
		const damage = this.power - target.fighter.defense;

		if (damage > 0) {
			results.push(
				new MessageResult(
					`${me.name} attacks ${target.name} for ${damage} hit points.`
				)
			);
			results.push(...target.fighter.takeDamage(target, damage));
		} else {
			results.push(
				new MessageResult(
					`${me.name} attacks ${target.name} but does no damage.`
				)
			);
		}

		return results;
	}
}
