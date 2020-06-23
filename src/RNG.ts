export type RNGSeed = [number, number, number, number];

const seedChars = '0123456789abcdefghjkmnpqrstvwxyz';

export function toReadable(seed: RNGSeed) {
	const offsets: number[] = [];
	var bleft = 5;
	var curb = 0;
	var set: string[] = [];

	for (var i = 0; i < 4; i++) {
		var s = seed[i];

		for (var b = 0; b < 32; b++) {
			if (s & 1) set.push(`${i},${b}`);

			curb = (curb << 1) | (s & 1);
			s >>= 1;
			bleft--;

			if (bleft == 0) {
				bleft = 5;
				offsets.push(curb);
				curb = 0;
			}
		}
	}
	offsets.push(curb);

	return offsets.map(o => seedChars[o]).join('');
}

export function fromReadable(raw: string) {
	const r = raw
		.toLowerCase()
		.replace(/[^0-9a-z]/g, '')
		.replace('o', '0')
		.replace('i', '1')
		.replace('l', '1')
		.replace('u', 'v');
	const offsets = r
		.substring(0, 26)
		.split('')
		.map(ch => seedChars.indexOf(ch));
	while (offsets.length < 26) offsets.push(0);

	const bit = (o: number, n: number) => (o & (1 << n) ? 1 : 0);
	const rawBits = offsets
		.flatMap(o => [bit(o, 4), bit(o, 3), bit(o, 2), bit(o, 1), bit(o, 0)])
		.slice(0, 130);
	const bits = rawBits.slice(0, 125).concat(rawBits.slice(127));

	const seed: RNGSeed = [0, 0, 0, 0];
	var si = -1,
		mask = 1;
	for (var bi = 0; bi < 128; bi++) {
		if (!(bi % 32)) {
			si++;
			mask = 1;
		}

		if (bits[bi]) seed[si] |= mask;

		mask <<= 1;
	}

	return seed;
}

/**
 * RNG using xorshift128
 */
export default class RNG {
	a!: number;
	b!: number;
	c!: number;
	d!: number;

	constructor(seed?: RNGSeed) {
		if (seed) {
			this.seed = seed;
		} else {
			const x = () => Math.floor(Math.random() * 0xffffffff);
			this.seed = [x(), x(), x(), x()];
		}
	}

	get seed(): RNGSeed {
		return [this.a, this.b, this.c, this.d];
	}

	set seed(seed: RNGSeed) {
		if (seed[0] == 0 && seed[1] == 0 && seed[2] == 0 && seed[3] == 0)
			throw 'Invalid seed';

		[this.a, this.b, this.c, this.d] = seed;
	}

	random() {
		var t = this.d;
		const s = this.a;
		this.d = this.c;
		this.c = this.b;
		this.b = s;

		t ^= t << 11;
		t ^= t >> 8;
		return (this.a = t ^ s ^ (s >> 19));
	}

	flip() {
		return this.random() % 2;
	}

	randint(min: number, max: number) {
		return min + (this.random() % (max - min + 1));
	}

	choose<T>(options: T[]) {
		return options[this.randint(0, options.length - 1)];
	}

	weighted<T>(options: [number, T][]) {
		const total = options.map(o => o[0]).reduce((a, b) => a + b);
		const roll = this.randint(0, total - 1);
		var running = 0;

		for (var i = 0; i < options.length; i++) {
			const [chance, option] = options[i];
			running += chance;

			if (running > roll) return option;
		}

		// TODO: this will never happen, but TypeScript doesn't like it otherwise
		throw 'today, a + b != b + a';
	}
}
