import { blockers } from '../queries';
import { Entity } from '../ecs';
import { Appearance, Position } from '../components';
import { EmbedTile, EmbedEnd, EmbedFG } from '../lib/TileConsole';

export function getBlocker(x: number, y: number) {
	return blockers.get().find(en => isAt(en, x, y));
}

function embedFg(fg: string) {
	return `${EmbedFG}${fg}${EmbedEnd}`;
}

function embedTile(tile: string) {
	return `${EmbedTile}${tile}${EmbedEnd}`;
}

export function iconOf(entity: Entity) {
	const appearance = entity.get(Appearance);
	if (!appearance) return '  ';

	const tiles =
		embedTile(appearance.tile) +
		(appearance.tile2 ? embedTile(appearance.tile2) : ' ');
	return embedFg(appearance.colour) + tiles + embedFg('reset');
}

export function nameOf(entity: Entity) {
	const appearance = entity.get(Appearance);
	return appearance ? appearance.name : 'something';
}

export function isAt(entity: Entity, x: number, y: number) {
	const position = entity.get(Position);
	return position ? position.x == x && position.y == y : false;
}
