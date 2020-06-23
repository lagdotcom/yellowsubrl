import { SysKeyEvent } from './tcod';
import Engine from './Engine';
import Entity, { getBlockingEntitiesAtLocation } from './Entity';

class MovementAction {
	constructor(private dx: number, private dy: number) {}

	perform(engine: Engine, en: Entity) {
		const destX = en.x + this.dx,
			destY = en.y + this.dy;

		if (!engine.gameMap.inBounds(destX, destY)) return;
		if (engine.gameMap.isBlocked(destX, destY)) return;

		const target = getBlockingEntitiesAtLocation(engine.entities, destX, destY);
		if (target) {
			// console.log(
			// 	`You kick the ${target.name} in the shins, much to its annoyance!`
			// );
		} else {
			en.move(this.dx, this.dy);
			engine.fovRecompute = en == engine.player;
		}
	}
}

class RemakeAction {
	perform(engine: Engine) {
		engine.newMap();
	}
}

class ChangeFontAction {
	perform(engine: Engine) {
		engine.changeFont();
	}
}

class ExploreMapAction {
	perform(engine: Engine) {
		const { gameMap } = engine;
		for (var x = 0; x < gameMap.width; x++)
			for (var y = 0; y < gameMap.height; y++)
				gameMap.tiles[x][y].explored = true;

		engine.fovRecompute = true;
	}
}

export function handleKeys(e?: SysKeyEvent) {
	if (!e) return;

	if (e.key == 'ArrowUp') return new MovementAction(0, -1);
	else if (e.key == 'ArrowDown') return new MovementAction(0, 1);
	else if (e.key == 'ArrowLeft') return new MovementAction(-1, 0);
	else if (e.key == 'ArrowRight') return new MovementAction(1, 0);

	if (e.key == 'R') return new RemakeAction();
	else if (e.key == 'F') return new ChangeFontAction();
	else if (e.key == 'X') return new ExploreMapAction();

	return;
}
