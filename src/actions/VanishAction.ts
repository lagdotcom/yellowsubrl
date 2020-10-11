import { Appearance, Position } from '../components';
import ecs, { Entity } from '../ecs';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import Result from '../results/Result';
import Action from './Action';

export default class VanishAction implements Action {
	constructor(public entity: Entity) {}

	perform(engine: Engine): Result[] {
		const results: Result[] = [];
		const a = this.entity.get(Appearance);
		const p = this.entity.get(Position);
		ecs.remove(this.entity);

		if (engine.fovMap.isInFov(p.x, p.y))
			results.push(new MessageResult(`${a.name} vanishes!`));
		return results;
	}
}
