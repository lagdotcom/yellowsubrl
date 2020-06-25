import Entity from '../Entity';
import { RenderOrder } from '../renderFunctions';

export type HasAppearance = Entity & { appearance: Appearance };

export default class Appearance {
	constructor(
		public ch: string,
		public colour: string,
		public order: RenderOrder
	) {}
}
