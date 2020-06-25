import Result from '../results/Result';
import Engine from '../Engine';
import Entity from '../Entity';

export default interface Action {
	perform(engine: Engine, entity: Entity): Result[];
}
