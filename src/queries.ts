import ecs from './ecs';
import { Appearance, AI, Blocks, Position } from './components';

export const blockers = ecs.query({ all: [Blocks, Position] });
export const hasAI = ecs.query({ all: [AI] });
export const renderable = ecs.query({ all: [Appearance, Position] });
