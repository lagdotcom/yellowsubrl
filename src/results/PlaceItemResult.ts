import Result from './Result';
import { Entity } from '../ecs';
import { Position } from '../components';

export default class PlaceItemResult implements Result {
	name: 'placeitem';
	constructor(private owner: Entity, private item: Entity) {
		this.name = 'placeitem';
	}

	perform(): Result[] {
		const position = this.owner.get(Position);

		if (position) this.item.add(Position, { x: position.x, y: position.y });

		return [];
	}
}
