import ecs from '../ecs';
import { Appearance, Item, Equippable } from '../components';
import { Colours } from '../tcod';
import { RenderOrder } from '../renderFunctions';

export const dagger = ecs
	.prefab('dagger')
	.add(Appearance, {
		name: 'dagger',
		tile: '/',
		colour: Colours.sky,
		order: RenderOrder.Item,
	})
	.add(Item, {})
	.add(Equippable, { slot: 'main', stats: { power: 2 } });

export const sword = ecs
	.prefab('sword')
	.add(Appearance, {
		name: 'sword',
		tile: '/',
		colour: Colours.sky,
		order: RenderOrder.Item,
	})
	.add(Item, {})
	.add(Equippable, { slot: 'main', stats: { power: 3 } });

export const shield = ecs
	.prefab('shield')
	.add(Appearance, {
		name: 'shield',
		tile: '[',
		colour: Colours.darkOrange,
		order: RenderOrder.Item,
	})
	.add(Item, {})
	.add(Equippable, { slot: 'offhand', stats: { defense: 1 } });
