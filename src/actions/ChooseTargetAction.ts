import Action from './Action';
import Engine from '../Engine';
import Entity from '../Entity';
import GameState from '../GameState';

export default class ChooseTargetAction implements Action {
	name: 'choosetarget';
	constructor(public x: number, public y: number) {
		this.name = 'choosetarget';
	}

	perform(engine: Engine, entity: Entity) {
		if (engine.gameState != GameState.Targeting || !engine.targetingItem)
			return [];

		const results = engine.targetingItem.item.use(
			engine.targetingItem,
			entity,
			engine,
			this.x,
			this.y
		);
		engine.gameStateStack.pop();
		return results;
	}
}
