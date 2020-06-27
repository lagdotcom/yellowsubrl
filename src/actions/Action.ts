import Result from '../results/Result';
import Engine from '../Engine';
import Entity from '../Entity';

export default interface Action {
	name: string;
	perform(engine: Engine, entity: Entity): Result[];
}
