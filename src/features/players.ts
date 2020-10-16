import ecs from '../ecs';
import {
	Player,
	Appearance,
	Fighter,
	Inventory,
	Blocks,
	Level,
	Equipment,
} from '../components';
import { Colours } from '../tcod';
import { RenderOrder } from '../renderFunctions';

export default function initPlayerPrefabs() {
	ecs
		.prefab('player.ringo')
		.add(Player, {})
		.add(Appearance, {
			name: 'you',
			tile: 'Player',
			tile2: 'Player2',
			colour: Colours.default,
			order: RenderOrder.Actor,
		})
		.add(Fighter, {
			hp: 100,
			stats: { maxHp: 100, defense: 1, power: 2 },
			xp: 0,
		})
		.add(Equipment, {})
		.add(Inventory, { capacity: 26, items: {} })
		.add(Blocks, {})
		.add(Level, {
			currentLevel: 1,
			currentXp: 0,
			levelUpBase: 200,
			levelUpFactor: 150,
		});
}
