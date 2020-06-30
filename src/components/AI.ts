import { Entity } from '../ecs';
import Engine from '../Engine';
import Result from '../results/Result';

export interface AIRoutine {
	perform(me: Entity, target: Entity, engine: Engine): Result[];
}

export default interface IAI {
	routine: AIRoutine;
}
