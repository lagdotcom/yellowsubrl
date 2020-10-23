import ecs from '../ecs';
import { Appearance } from '../components';
import Colours from '../Colours';
import RenderOrder from '../RenderOrder';

export const stairsPrefab = ecs.prefab('stairs').add(Appearance, {
	name: 'stairs',
	tile: 'Stairs',
	tile2: 'Stairs2',
	colour: Colours.white,
	order: RenderOrder.Stairs,
	revealforever: true,
});
