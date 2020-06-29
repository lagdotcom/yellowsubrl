import { ItemUseFn } from './components/Item';
import { Colours } from './tcod';
import {
	heal,
	castLightning,
	castFireball,
	castConfuse,
} from './itemFunctions';
import MessageResult from './results/MessageResult';

interface ItemSpawn {
	name: string;
	colour: string;
	char: string;
	targeting?: boolean;
	targetingMessage?: MessageResult;
	use: ItemUseFn;
}
export const itemSpawnData: [number, ItemSpawn][] = [
	[
		70,
		{
			name: 'healing potion',
			colour: Colours.violet,
			char: '!',
			use: (item, en) => heal({ item, en, amount: 4 }),
		},
	],
	[
		15,
		{
			name: 'fireball scroll',
			colour: Colours.red,
			char: '#',
			targeting: true,
			targetingMessage: new MessageResult(
				'Left-click a target tile for the fireball, or Esc to cancel.',
				Colours.lightCyan
			),
			use: (item, caster, engine, x, y) =>
				castFireball({
					item,
					caster,
					entities: engine.entities,
					fovMap: engine.fovMap,
					damage: 12,
					radius: 3,
					targetX: x!,
					targetY: y!,
				}),
		},
	],
	[
		10,
		{
			name: 'lightning scroll',
			colour: Colours.yellow,
			char: '#',
			use: (item, caster, engine) =>
				castLightning({
					item,
					caster,
					entities: engine.entities,
					fovMap: engine.fovMap,
					damage: 20,
					range: 5,
				}),
		},
	],
	[
		10,
		{
			name: 'confusion scroll',
			colour: Colours.lightPink,
			char: '#',
			targeting: true,
			targetingMessage: new MessageResult(
				'Left-click an enemy to confuse it, or Esc to cancel.',
				Colours.lightCyan
			),
			use: (item, caster, engine, x, y) =>
				castConfuse(item, caster, engine.entities, engine.fovMap, 10, x!, y!),
		},
	],
];

interface EnemySpawn {
	name: string;
	colour: string;
	char: string;
	hp: number;
	defense: number;
	power: number;
}
export const enemySpawnData: [number, EnemySpawn][] = [
	[
		8,
		{
			name: 'Orc',
			colour: Colours.green,
			char: 'o',
			hp: 10,
			defense: 0,
			power: 3,
		},
	],
	[
		2,
		{
			name: 'Troll',
			colour: Colours.darkGreen,
			char: 'T',
			hp: 16,
			defense: 1,
			power: 4,
		},
	],
];
