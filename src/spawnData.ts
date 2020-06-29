import {
	confusionScroll,
	healingPotion,
	fireballScroll,
	lightningScroll,
} from './items/consumables';
import { orc, troll } from './enemies/greenskins';
import ItemSpawn from './items/ItemSpawn';
import EnemySpawn from './enemies/EnemySpawn';

export const itemSpawnData: [number, ItemSpawn][] = [
	[70, healingPotion],
	[15, fireballScroll],
	[10, lightningScroll],
	[10, confusionScroll],
];

export const enemySpawnData: [number, EnemySpawn][] = [
	[8, orc],
	[2, troll],
];
