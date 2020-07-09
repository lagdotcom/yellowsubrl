import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';
import { Entity } from '../ecs';
import { Item } from '../components';

export default class ChooseTargetAction implements Action {
	name: 'choosetarget';
	constructor(public x: number, public y: number) {
		this.name = 'choosetarget';
	}

	perform(engine: Engine, entity: Entity) {
		if (engine.gameState != GameState.Targeting || !engine.targetingItem)
			return [];

		const results = engine.targetingItem.get(Item).use!(
			engine.targetingItem,
			entity,
			engine,
			engine.scrollX + Math.floor(this.x / 2),
			engine.scrollY + this.y
		);
		engine.gameStateStack.pop();
		return results;
	}
}
