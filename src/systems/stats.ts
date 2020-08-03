import { Entity } from '../ecs';
import { Fighter, Stat } from '../components';
import { getEquipmentBonus } from './equipment';

export function getStat(e: Entity, stat: Stat) {
	const fighter = e.get(Fighter);
	const base = fighter.stats[stat];

	return base + getEquipmentBonus(e, stat);
}
