import { Colours } from '../tcod';
import EnemySpawn from './EnemySpawn';

export const orc: EnemySpawn = {
	name: 'orc',
	colour: Colours.green,
	tile: 'Orc',
	hp: 10,
	defense: 0,
	power: 3,
};

export const troll: EnemySpawn = {
	name: 'troll',
	colour: Colours.darkGreen,
	tile: 'Troll',
	hp: 16,
	defense: 1,
	power: 4,
};
