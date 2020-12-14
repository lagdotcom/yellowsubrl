import source from '../res/groovy12x24.png';
import { Charmap } from './lib/Tileset';

const GroovyTileset = {
	source,
	columns: 32,
	rows: 10,
	charmap: {
		'!': [1, 0],
		'"': [2, 0],
		'#': [3, 0],
		$: [4, 0],
		'%': [5, 0],
		'&': [6, 0],
		"'": [7, 0],
		'(': [8, 0],
		')': [9, 0],
		'*': [10, 0],
		'+': [11, 0],
		',': [12, 0],
		'-': [13, 0],
		'.': [14, 0],
		'/': [15, 0],
		'0': [16, 0],
		'1': [17, 0],
		'2': [18, 0],
		'3': [19, 0],
		'4': [20, 0],
		'5': [21, 0],
		'6': [22, 0],
		'7': [23, 0],
		'8': [24, 0],
		'9': [25, 0],
		':': [26, 0],
		';': [27, 0],

		A: [0, 3],
		B: [1, 3],
		C: [2, 3],
		D: [3, 3],
		E: [4, 3],
		F: [5, 3],
		G: [6, 3],
		H: [7, 3],
		I: [8, 3],
		J: [9, 3],
		K: [10, 3],
		L: [11, 3],
		M: [12, 3],
		N: [13, 3],
		O: [14, 3],
		P: [15, 3],
		Q: [16, 3],
		R: [17, 3],
		S: [18, 3],
		T: [19, 3],
		U: [20, 3],
		V: [21, 3],
		W: [22, 3],
		X: [23, 3],
		Y: [24, 3],
		Z: [25, 3],
		'[': [26, 3],
		'\\': [27, 3],
		']': [28, 3],
		'^': [29, 3],

		a: [0, 4],
		b: [1, 4],
		c: [2, 4],
		d: [3, 4],
		e: [4, 4],
		f: [5, 4],
		g: [6, 4],
		h: [7, 4],
		i: [8, 4],
		j: [9, 4],
		k: [10, 4],
		l: [11, 4],
		m: [12, 4],
		n: [13, 4],
		o: [14, 4],
		p: [15, 4],
		q: [16, 4],
		r: [17, 4],
		s: [18, 4],
		t: [19, 4],
		u: [20, 4],
		v: [21, 4],
		w: [22, 4],
		x: [23, 4],
		y: [24, 4],
		z: [25, 4],

		Player: [0, 8],
		Player2: [1, 8],
		Orc: [2, 8],
		Orc2: [3, 8],
		Troll: [4, 8],
		Troll2: [5, 8],
		Potion: [6, 8],
		Potion2: [7, 8],
		Scroll: [8, 8],
		Scroll2: [9, 8],
		Guitar: [10, 8],
		Guitar2: [11, 8],
		Flute: [12, 8],
		Flute2: [13, 8],
		Drum: [14, 8],
		Drum2: [15, 8],

		Stairs: [16, 8],
		Stairs2: [17, 8],

		Door: [0, 9],
		Door2: [1, 9],
		DoorOpen: [2, 9],
		DoorOpen2: [3, 9],
		FlyingBowlerHat: [4, 9],
		FlyingBowlerHat2: [5, 9],
		Eggcup: [6, 9],
		Eggcup2: [7, 9],
		BowlerHat: [8, 9],
		BowlerHat2: [9, 9],
	} as Charmap,
};
export default GroovyTileset;
