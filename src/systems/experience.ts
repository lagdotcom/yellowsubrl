import { Entity } from '../ecs';
import { Level } from '../components';

export function xpForNextLevel(e: Entity) {
	const lvl = e.get(Level);
	if (!lvl) return Infinity;

	return lvl.levelUpBase + lvl.currentLevel * lvl.levelUpFactor;
}

export function addXp(e: Entity, amount: number) {
	const lvl = e.get(Level);
	if (!lvl) return false;

	const next = xpForNextLevel(e);
	lvl.currentXp += amount;
	if (lvl.currentXp >= next) {
		lvl.currentLevel++;
		lvl.currentXp -= next;
		return true;
	}

	return false;
}
