import Action from './Action';
import Engine from '../Engine';
import { Entity } from '../ecs';
import { Fighter } from '../components';
import GameState from '../GameState';

export enum LevelUpResponse {
	HP,
	Strength,
	Agility,
}

export default class LevelUpAction implements Action {
	name: string;
	constructor(public response: LevelUpResponse) {
		this.name = 'levelup';
	}

	perform(engine: Engine, entity: Entity) {
		if (engine.gameState != GameState.LevelUp) return [];

		const fighter = entity.get(Fighter);

		switch (this.response) {
			case LevelUpResponse.HP:
				fighter.hp += 20;
				fighter.maxHp += 20;
				break;

			case LevelUpResponse.Strength:
				fighter.power++;
				break;

			case LevelUpResponse.Agility:
				fighter.defense++;
				break;
		}

		engine.gameStateStack.pop();
		engine.refresh();
		return [];
	}
}
