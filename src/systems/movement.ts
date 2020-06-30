import { getBlocker } from './entities';
import GameMap from '../GameMap';
import { Entity, Position, blockers } from '../ecs';
import { AStar, Map } from '../tcod';

export interface XY {
	x: number;
	y: number;
}

export function distance(a: XY, b: XY) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function moveTowards(entity: Entity, dest: XY, gameMap: GameMap) {
	const position = entity.get(Position);
	if (!position) return;

	const dx = dest.x - position.x;
	const dy = dest.y - position.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	const mx = Math.round(dx / distance);
	const my = Math.round(dy / distance);
	if (
		!gameMap.isBlocked(position.x + mx, position.y + my) &&
		!getBlocker(position.x + mx, position.y + my)
	) {
		dest.x += mx;
		dest.y += my;
	}
}

export function moveAstar(
	entity: Entity,
	target: Entity,
	gameMap: GameMap,
	goal?: XY
) {
	const position = entity.get(Position);
	const enemy = target.get(Position);
	if (!position || !enemy) return;

	goal = goal || enemy;
	const fov = new Map(gameMap.width, gameMap.height);

	for (var x = 0; x < gameMap.width; x++)
		for (var y = 0; y < gameMap.height; y++)
			fov.setProperties(
				x,
				y,
				!gameMap.tiles[x][y].blockSight,
				!gameMap.tiles[x][y].blocked
			);

	blockers.get().forEach(en => {
		if (en != target) {
			const pos = en.get(Position);
			fov.setProperties(pos.x, pos.y, true, false);
		}
	});

	const finder = new AStar(fov, 1);
	const path = finder.getPath(position.x, position.y, goal.x, goal.y);

	if (path && path.length < 25) {
		const next = path[0];
		[position.x, position.y] = next;
	} else {
		return moveTowards(entity, goal, gameMap);
	}
}
