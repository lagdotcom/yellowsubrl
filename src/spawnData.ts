import {
	confusionScroll,
	healingPotion,
	fireballScroll,
	lightningScroll,
} from './items/consumables';
import { orc, troll } from './enemies/greenskins';
import {
	tuba,
	acoustic,
	bass,
	electric,
	flute,
	sitar,
	snare,
	trombone,
	violin,
} from './items/instruments';
import { Prefab } from './ecs';

export const itemSpawnData: [number, Prefab][] = [
	[70, healingPotion],
	[15, fireballScroll],
	[10, lightningScroll],
	[10, confusionScroll],

	[5, acoustic],
	[5, bass],
	[5, electric],
	[5, flute],
	[5, sitar],
	[5, snare],
	[5, trombone],
	[5, tuba],
	[5, violin],
];

export const enemySpawnData: [number, Prefab][] = [
	[8, orc],
	[2, troll],
];
