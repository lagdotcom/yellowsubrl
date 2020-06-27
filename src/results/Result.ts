import Engine from '../Engine';

export default interface Result {
	name: string;
	perform(engine: Engine): Result[];
}
