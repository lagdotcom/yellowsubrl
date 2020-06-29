import { Colours } from '../tcod';
import EnemySpawn from './EnemySpawn';

export const orc: EnemySpawn = {
	name: 'Orc',
	colour: Colours.green,
	char: 'o',
	hp: 10,
	defense: 0,
	power: 3,
};

export const troll: EnemySpawn = {
	name: 'Troll',
	colour: Colours.darkGreen,
	char: 'T',
	hp: 16,
	defense: 1,
	power: 4,
};
