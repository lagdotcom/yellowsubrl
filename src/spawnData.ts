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
import { sword, shield } from './items/equipment';
import { WeightTable } from './RNG';

export function fscale(floor: number, ...entries: WeightTable<number>) {
	var found = 0;

	for (var i = 0; i < entries.length; i++) {
		const [chance, target] = entries[i];
		if (floor >= target) found = chance;
	}

	return found;
}

export function getItemSpawnChances(floor: number): WeightTable<Prefab> {
	return [
		[70, healingPotion],
		[fscale(floor, [25, 6]), fireballScroll],
		[fscale(floor, [25, 4]), lightningScroll],
		[fscale(floor, [10, 2]), confusionScroll],
		[fscale(floor, [5, 4]), sword],
		[fscale(floor, [15, 8]), shield],

		// [5, acoustic],
		// [5, bass],
		// [5, electric],
		// [5, flute],
		// [5, sitar],
		// [5, snare],
		// [5, trombone],
		// [5, tuba],
		// [5, violin],
	];
}

export function getEnemySpawnChances(floor: number): WeightTable<Prefab> {
	return [
		[80, orc],
		[fscale(floor, [15, 3], [30, 5], [60, 7]), troll],
	];
}
