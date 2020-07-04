import { Entity } from '../ecs';
import Engine from '../Engine';
import Result from '../results/Result';
import { basicAI, confusedAI } from '../systems/ai';

export type AIRoutineName = 'basic' | 'confused';

export type AIRoutine = (
	me: Entity,
	target: Entity,
	engine: Engine
) => Result[];

export const AIRoutines: { [name: string]: AIRoutine } = {
	basic: basicAI,
	confused: confusedAI,
};

export default interface IAI {
	routine: AIRoutineName;
	vars: any;
}
