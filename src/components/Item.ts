import Entity from '../Entity';
import Result from '../results/Result';
import Engine from '../Engine';
import MessageResult from '../results/MessageResult';

export type HasItem = Entity & { item: Item };
export type ItemUseFn = (
	item: HasItem,
	entity: Entity,
	engine: Engine,
	x?: number,
	y?: number
) => Result[];

export default class Item {
	constructor(
		public use?: ItemUseFn,
		public targeting: boolean = false,
		public targetingMessage?: MessageResult
	) {}
}
