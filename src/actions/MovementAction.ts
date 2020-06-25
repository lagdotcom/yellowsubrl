import Engine from '../Engine';
import Entity, { getBlockingEntitiesAtLocation } from '../Entity';
import GameState from '../GameState';
import { HasFighter } from '../components/Fighter';
import Action from './Action';
import Result from '../results/Result';
import MessageResult from '../results/MessageResult';

export default class MovementAction implements Action {
	constructor(private dx: number, private dy: number) {}

	perform(engine: Engine, en: Entity) {
		const results: Result[] = [];

		if (!en.location || !en.fighter) return results;
		if (en.fighter.hp <= 0) return results;

		const destX = en.location.x + this.dx,
			destY = en.location.y + this.dy;

		if (!engine.gameMap.inBounds(destX, destY)) return results;
		if (engine.gameMap.isBlocked(destX, destY)) return results;

		const target = getBlockingEntitiesAtLocation(engine.entities, destX, destY);
		if (target) {
			if (target.fighter) {
				results.push(
					...en.fighter.attack(en as HasFighter, target as HasFighter)
				);
			} else {
				results.push(new MessageResult(`You bump into ${target.name}.`));
			}
		} else {
			en.location.move(this.dx, this.dy);
			engine.fovRecompute = en == engine.player;
		}

		engine.gameState = GameState.EnemyTurn;
		return results;
	}
}
