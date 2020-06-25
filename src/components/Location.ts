import GameMap from '../GameMap';
import Entity, { getBlockingEntitiesAtLocation } from '../Entity';
import { Map } from '../libtcod/Map';
import { AStar } from '../libtcod/AStar';

export type HasLocation = Entity & { location: Location };

export default class Location {
	constructor(public x: number, public y: number, public blocks: boolean) {}

	move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	distanceTo(other: Location) {
		const dx = other.x - this.x;
		const dy = other.y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	moveTowards(tx: number, ty: number, gameMap: GameMap, entities: Entity[]) {
		const dx = tx - this.x;
		const dy = ty - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		const mx = Math.round(dx / distance);
		const my = Math.round(dy / distance);
		if (
			!gameMap.isBlocked(this.x + mx, this.y + my) &&
			!getBlockingEntitiesAtLocation(entities, this.x + mx, this.y + my)
		)
			this.move(mx, my);
	}

	moveAstar(
		me: HasLocation,
		target: HasLocation,
		gameMap: GameMap,
		entities: Entity[]
	) {
		const fov = new Map(gameMap.width, gameMap.height);

		for (var x = 0; x < gameMap.width; x++)
			for (var y = 0; y < gameMap.height; y++)
				fov.setProperties(
					x,
					y,
					!gameMap.tiles[x][y].blockSight,
					!gameMap.tiles[x][y].blocked
				);

		entities.forEach(en => {
			if (en.location && en.location.blocks && en != me && en != target)
				fov.setProperties(en.location.x, en.location.y, true, false);
		});

		const finder = new AStar(fov, 1);
		const path = finder.getPath(
			this.x,
			this.y,
			target.location.x,
			target.location.y
		);

		if (path && path.length < 25) {
			const next = path[0];
			[this.x, this.y] = next;
		} else {
			this.moveTowards(target.location.x, target.location.y, gameMap, entities);
		}
	}
}
