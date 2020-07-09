import { Entity } from '../ecs';
import { getBlocker, nameOf } from '../systems/entities';
import { attack } from '../systems/combat';
import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';
import MessageResult from '../results/MessageResult';
import Result from '../results/Result';
import { Fighter, Position, Player } from '../components';

export default class MovementAction implements Action {
	name: 'movement';
	constructor(private dx: number, private dy: number) {
		this.name = 'movement';
	}

	perform(engine: Engine, en: Entity) {
		const results: Result[] = [];

		const fighter = en.get(Fighter);
		const position = en.get(Position);

		if (!fighter || !position || fighter.hp <= 0) return results;

		const destX = position.x + this.dx,
			destY = position.y + this.dy;

		if (!engine.gameMap.contains(destX, destY)) return results;
		if (engine.gameMap.isBlocked(destX, destY)) return results;

		const target = getBlocker(destX, destY);
		if (target) {
			const enemy = target.get(Fighter);

			if (enemy) {
				results.push(...attack(en, target));
			} else {
				results.push(
					new MessageResult(`${nameOf(en)} bumps into ${nameOf(target)}`)
				);
			}
		} else {
			position.x = destX;
			position.y = destY;

			if (en.get(Player)) {
				engine.fovRecompute = true;
				engine.updateScroll();
			}
		}

		engine.gameStateStack.swap(GameState.EnemyTurn);
		return results;
	}
}
