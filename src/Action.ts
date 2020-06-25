import Engine from './Engine';
import Entity from './Entity';
import Result from './results/Result';

export interface Action {
	perform(engine: Engine, entity: Entity): Result[];
}
