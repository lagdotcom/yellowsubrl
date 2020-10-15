import { AI, Appearance, Blocks, Fighter } from '../components';
import ecs from '../ecs';
import { RenderOrder } from '../renderFunctions';
import { Colours } from '../tcod';

const enemy = ecs
	.prefab('pierEnemy')
	.add(Blocks, {})
	.add(AI, { routine: 'pierEnemy', vars: {} });

export const bowlerHat = ecs
	.prefab('bowlerHat', enemy)
	.add(Appearance, {
		name: 'bowler hat',
		tile: 'BowlerHat',
		tile2: 'BowlerHat2',
		colour: Colours.black,
		order: RenderOrder.Actor,
	})
	.add(Fighter, {
		hp: 4,
		xp: 1,
		stats: { defense: 0, power: 2, maxHp: 4 },
	});

export const eggcup = ecs
	.prefab('eggcup', enemy)
	.add(Appearance, {
		name: 'eggcup',
		tile: 'Eggcup',
		tile2: 'Eggcup2',
		colour: Colours.white,
		order: RenderOrder.Actor,
	})
	.add(Fighter, { hp: 10, xp: 1, stats: { defense: 1, power: 1, maxHp: 10 } });
