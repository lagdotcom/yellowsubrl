import RNG from '../RNG';
import GameMap from '../GameMap';
import { Rect } from '../mapObjects';
import ecs from '../ecs';
import { stairsPrefab } from '../features/stairs';
import { Stairs, Position } from '../components';

class Leaf {
	left?: Leaf;
	right?: Leaf;
	room?: Rect;

	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number
	) {}

	split(rng: RNG, minLeaf: number) {
		const { x, y, w, h } = this;

		if (this.left || this.right) return false;

		var horizontal = rng.flip();
		if (w > h && w / h >= 1.25) horizontal = false;
		else if (h > w && h / w >= 1.25) horizontal = true;

		const max = (horizontal ? h : w) - minLeaf;
		if (max < minLeaf) return false;

		const split = rng.randint(minLeaf, max);
		if (horizontal) {
			this.left = new Leaf(x, y, w, split);
			this.right = new Leaf(x, y + split, w, h - split);
		} else {
			this.left = new Leaf(x, y, split, h);
			this.right = new Leaf(x + split, y, w - split, h);
		}

		return true;
	}

	createRoom(rng: RNG, gameMap: GameMap, minRoom: number) {
		if (this.left || this.right) {
			if (this.left) this.left.createRoom(rng, gameMap, minRoom);
			if (this.right) this.right.createRoom(rng, gameMap, minRoom);

			if (this.left && this.right)
				this.createHall(
					rng,
					gameMap,
					this.left.getRoom(rng) as Rect,
					this.right.getRoom(rng) as Rect
				);
		} else {
			const w = rng.randint(minRoom, this.w - 2);
			const h = rng.randint(minRoom, this.h - 2);
			const x = rng.randint(0, this.w - w - 1);
			const y = rng.randint(0, this.h - h - 1);

			this.room = new Rect(this.x + x, this.y + y, w, h);
			gameMap.createRoom(this.room);
		}
	}

	getRoom(rng: RNG): Rect | undefined {
		if (this.room) return this.room;

		var left = this.left && this.left.getRoom(rng);
		var right = this.right && this.right.getRoom(rng);

		if (!left && !right) return undefined;
		if (!right) return left;
		if (!left) return right;

		return rng.flip() ? left : right;
	}

	createHall(rng: RNG, gameMap: GameMap, a: Rect, b: Rect) {
		const ax = rng.randint(a.x1 + 1, a.x2 - 1);
		const ay = rng.randint(a.y1 + 1, a.y2 - 1);
		const bx = rng.randint(b.x1 + 1, b.x2 - 1);
		const by = rng.randint(b.y1 + 1, b.y2 - 1);

		const w = bx - ax;
		const h = by - ay;

		if (w) {
			if (h) {
				if (rng.flip()) {
					gameMap.createHTunnel(ax, bx, ay);
					gameMap.createVTunnel(ay, by, bx);
				} else {
					gameMap.createHTunnel(ax, bx, by);
					gameMap.createVTunnel(ay, by, ax);
				}
			} else {
				gameMap.createHTunnel(ax, bx, by);
			}
		} else {
			gameMap.createVTunnel(ay, by, bx);
		}
	}
}

export default class BSPTree {
	constructor(
		public minRoom: number,
		public minLeaf: number,
		public maxLeaf: number,
		public splitChance: number,
		public maxMonstersPerRoom: number,
		public maxItemsPerRoom: number
	) {}

	generate(rng: RNG, gameMap: GameMap) {
		const { minRoom, minLeaf, maxLeaf, splitChance } = this;

		const root = new Leaf(0, 0, gameMap.width, gameMap.height);
		const leaves = [root];
		const position = { x: 0, y: 0 };

		var go = true;
		while (go) {
			go = false;

			leaves.slice().forEach(l => {
				if (
					l.w > maxLeaf ||
					l.h > maxLeaf ||
					rng.randint(0, 100) < splitChance
				) {
					if (l.split(rng, minLeaf)) {
						leaves.push(l.left as Leaf);
						leaves.push(l.right as Leaf);
						go = true;
					}
				}
			});
		}

		var last = [0, 0];
		var first = true;
		root.createRoom(rng, gameMap, minRoom);
		leaves.forEach(l => {
			if (l.room) {
				if (first) {
					first = false;
					position.x = rng.randint(l.room.x1 + 1, l.room.x2 - 1);
					position.y = rng.randint(l.room.y1 + 1, l.room.y2 - 1);
				} else {
					gameMap.placeEntities(
						rng,
						l.room,
						this.maxMonstersPerRoom,
						this.maxItemsPerRoom
					);
					last = l.room.centre();
				}
			}
		});

		ecs
			.entity(stairsPrefab)
			.add(Stairs, { floor: gameMap.floor + 1 })
			.add(Position, { x: last[0], y: last[1] });

		return position;
	}
}
