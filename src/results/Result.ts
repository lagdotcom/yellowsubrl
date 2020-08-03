import Engine from '../Engine';

export default interface Result {
	perform(engine: Engine): Result[];
}
