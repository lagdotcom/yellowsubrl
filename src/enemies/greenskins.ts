import ecs from '../ecs';
import { Colours } from '../tcod';
import { RenderOrder } from '../renderFunctions';
import { AI, Appearance, Blocks, Fighter } from '../components';

const enemy = ecs
	.prefab('enemy')
	.add(Blocks, {})
	.add(AI, { routine: 'basic', vars: {} });

export const orc = ecs
	.prefab('orc', enemy)
	.add(Appearance, {
		name: 'orc',
		tile: 'Orc',
		tile2: 'Orc2',
		colour: Colours.green,
		order: RenderOrder.Actor,
	})
	.add(Fighter, { hp: 10, maxHp: 10, defense: 0, power: 3, xp: 35 });

export const troll = ecs
	.prefab('troll', enemy)
	.add(Appearance, {
		name: 'troll',
		tile: 'Troll',
		tile2: 'Troll2',
		colour: Colours.darkGreen,
		order: RenderOrder.Actor,
	})
	.add(Fighter, { hp: 16, maxHp: 16, defense: 1, power: 4, xp: 100 });
