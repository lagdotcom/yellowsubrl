import Engine from './Engine';
import Entity from './Entity';

export interface Action {
	perform(engine: Engine, entity: Entity): void;
}
