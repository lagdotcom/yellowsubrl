import Result from './Result';
import { HasInventory } from '../components/Inventory';
import { HasItem } from '../components/Item';
import Location, { HasLocation } from '../components/Location';
import Engine from '../Engine';

export default class PlaceItemResult implements Result {
	name: 'placeitem';
	constructor(
		private owner: HasInventory & HasLocation,
		private item: HasItem
	) {
		this.name = 'placeitem';
	}

	perform(engine: Engine): Result[] {
		this.item.location = new Location(
			this.owner.location.x,
			this.owner.location.y,
			false
		);
		engine.entities.push(this.item);

		return [];
	}
}
