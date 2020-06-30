import { Entity } from './ecs';
import Engine from './Engine';
import Result from './results/Result';

export interface Action {
	perform(engine: Engine, entity: Entity): Result[];
}
