import { RenderOrder } from '../renderFunctions';

export default interface IAppearance {
	name: string;
	tile: string;
	tile2?: string;
	colour: string;
	order: RenderOrder;
}
