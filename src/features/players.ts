import ecs from '../ecs';
import {
	Player,
	Appearance,
	Fighter,
	Inventory,
	Blocks,
	Level,
} from '../components';
import { Colours } from '../tcod';
import { RenderOrder } from '../renderFunctions';

export const ringoPrefab = ecs
	.prefab('player')
	.add(Player, {})
	.add(Appearance, {
		name: 'you',
		tile: 'Player',
		tile2: 'Player2',
		colour: Colours.white,
		order: RenderOrder.Actor,
	})
	.add(Fighter, { hp: 30, maxHp: 30, defense: 2, power: 5, xp: 0 })
	.add(Inventory, { capacity: 26, items: {} })
	.add(Blocks, {})
	.add(Level, {
		currentLevel: 1,
		currentXp: 0,
		levelUpBase: 200,
		levelUpFactor: 150,
	});
