import Result from './Result';
import { Entity } from '../ecs';
import { Equipment, Equippable } from '../components';
import MessageResult from './MessageResult';
import { nameOf } from '../systems/entities';
import CloseInventoryResult from './CloseInventoryResult';
import ConsumeTurnResult from './ConsumeTurnResult';

export default class RemoveItemResult implements Result {
	constructor(public entity: Entity, public item: Entity) {}

	perform() {
		const equipment = this.entity.get(Equipment);
		const quip = this.item.get(Equippable);

		delete equipment[quip.slot];
		return [
			new MessageResult(`You removed the ${nameOf(this.item)}.`),
			new CloseInventoryResult(),
			new ConsumeTurnResult(),
		];
	}
}
