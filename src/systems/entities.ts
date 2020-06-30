import ecs, { Blocks, Position, Entity, Appearance } from '../ecs';

const blockers = ecs.query({ all: [Blocks, Position] });

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
