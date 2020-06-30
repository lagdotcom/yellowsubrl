import Result from '../results/Result';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';
import { Entity } from '../ecs';

export type ItemUseFn = (
	item: Entity,
	entity: Entity,
	engine: Engine,
	x?: number,
	y?: number
) => Result[];

export default interface IItem {
	use?: ItemUseFn;
	targeting?: boolean;
	targetingMessage?: MessageResult;
}
