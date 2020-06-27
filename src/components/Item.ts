import Entity from '../Entity';
import Result from '../results/Result';

export type HasItem = Entity & { item: Item };

export default class Item {
	constructor(public use: (item: HasItem, entity: Entity) => Result[]) {}
}
