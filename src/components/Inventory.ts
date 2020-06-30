import { Entity } from '../ecs';

export default interface IInventory {
	capacity: number;
	items: Entity[];
}
