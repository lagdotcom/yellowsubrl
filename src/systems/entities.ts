import { blockers } from '../queries';
import { Entity } from '../ecs';
import { Appearance, Position } from '../components';

export function getBlocker(x: number, y: number) {
	return blockers.get().find(en => isAt(en, x, y));
}

export function nameOf(entity: Entity) {
	const appearance = entity.get(Appearance);
	return appearance ? appearance.name : 'something';
}

export function isAt(entity: Entity, x: number, y: number) {
	const position = entity.get(Position);
	return position ? position.x == x && position.y == y : false;
}
