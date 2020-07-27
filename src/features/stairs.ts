import ecs from '../ecs';
import { Appearance } from '../components';
import { Colours } from '../tcod';
import { RenderOrder } from '../renderFunctions';

export const stairsPrefab = ecs.prefab('stairs').add(Appearance, {
	name: 'stairs',
	tile: 'Stairs',
	tile2: 'Stairs2',
	colour: Colours.white,
	order: RenderOrder.Stairs,
	revealforever: true,
});
