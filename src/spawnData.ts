import { WeightTable } from './RNG';

export function fscale(floor: number, ...entries: WeightTable<number>) {
	var found = 0;

	for (var i = 0; i < entries.length; i++) {
		const [chance, target] = entries[i];
		if (floor >= target) found = chance;
	}

	return found;
}
