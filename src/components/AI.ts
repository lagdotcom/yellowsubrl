import Result from '../results/Result';
import Entity from '../Entity';
import Engine from '../Engine';

export type HasAI = Entity & { ai: AI };
export default interface AI {
	takeTurn(me: Entity, target: Entity, engine: Engine): Result[];
}
