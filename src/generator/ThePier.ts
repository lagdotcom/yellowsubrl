import GameMap from '../GameMap';
import { Rect } from '../mapObjects';
import RNG from '../RNG';
import { XYtoTag } from '../systems/movement';

enum Direction {
	Up,
	Right,
	Down,
	Left,
}

function dname(d: Direction) {
	switch (d) {
		case Direction.Down:
			return 'd';
		case Direction.Left:
			return 'l';
		case Direction.Right:
			return 'r';
		case Direction.Up:
			return 'u';
	}
}

function turnleft(d: Direction) {
	switch (d) {
		case Direction.Down:
			return Direction.Right;
		case Direction.Right:
			return Direction.Up;
		case Direction.Up:
			return Direction.Left;
		case Direction.Left:
			return Direction.Down;
	}
}

function turnright(d: Direction) {
	switch (d) {
		case Direction.Down:
			return Direction.Left;
		case Direction.Right:
			return Direction.Down;
		case Direction.Up:
			return Direction.Right;
		case Direction.Left:
			return Direction.Up;
	}
}

function tomove(d: Direction) {
	switch (d) {
		case Direction.Down:
			return [0, 1];
		case Direction.Left:
			return [-1, 0];
		case Direction.Right:
			return [1, 0];
		case Direction.Up:
			return [0, -1];
	}
}

class Digger {
	alive: boolean;
	life: number;

	constructor(
		public x: number,
		public y: number,
		public w: number,
		public d: Direction
	) {
		this.alive = true;
		this.life = 0;
	}

	dig(pier: ThePier) {
		console.log('[dig', this.x, this.y, dname(this.d) + ']');

		if (!pier.bounds.contains(this.x, this.y)) {
			console.log('auto turn');
			if (!this.turn(pier)) {
				console.log('oob dead');
				this.alive = false;
				return;
			}
		}

		if (!pier.carve(this.x, this.y, this.w, this.d)) {
			console.log('recarve, dead');
			this.alive = false;
			return;
		}

		if (this.life > this.w && pier.rng.randint(0, 99) < 10) {
			if (pier.rng.flip()) {
				this.branch(pier);
			} else {
				if (this.turn(pier)) {
					if (pier.rng.randint(0, 99) < 50) {
						this.split(pier);
					}
				}
			}
		}

		const [dx, dy] = tomove(this.d);
		this.x += dx;
		this.y += dy;

		this.life++;
	}

	turn(pier: ThePier) {
		const canl = this.cango(pier, turnleft(this.d));
		const canr = this.cango(pier, turnright(this.d));

		if (!canl && !canr) {
			console.log('cannot turn');
			return false;
		}

		var left: boolean;
		if (canl) {
			if (canr) left = pier.rng.flip();
			else left = true;
		} else left = false;

		if (left) {
			this.d = turnleft(this.d);
			console.log('turn left');
		} else {
			this.d = turnright(this.d);
			console.log('turn right');
		}

		const [dx, dy] = tomove(this.d);
		this.x += dx;
		this.y += dy;
		return true;
	}

	cango(pier: ThePier, d: Direction) {
		const [dx, dy] = tomove(d);
		const x = this.x + dx;
		const y = this.y + dy;

		return pier.bounds.contains(x, y);
	}

	split(pier: ThePier, d?: Direction) {
		const { x, y, w } = this;
		if (d === undefined) d = turnleft(turnleft(this.d));
		const [dx, dy] = tomove(d);
		const sx = x + dx * w;
		const sy = y + dy * w;

		if (pier.gameMap.contains(sx, sy)) {
			pier.diggers.push(new Digger(sx, sy, w, d));
			console.log('split');
		}
	}

	branch(pier: ThePier) {}
}

export default class ThePier {
	bounds!: Rect;
	carved!: Set<string>;
	diggers: Digger[];
	gameMap!: GameMap;
	rng!: RNG;

	constructor(
		public corridorWidth: number,
		public mapWidth: number,
		public mapHeight: number
	) {
		this.diggers = [];
	}

	generate(rng: RNG, gameMap: GameMap) {
		this.carved = new Set<string>();

		const { corridorWidth, mapWidth, mapHeight } = this;
		this.rng = rng;
		this.gameMap = gameMap;
		this.bounds = new Rect(
			0,
			0,
			mapWidth - corridorWidth - 1,
			mapHeight - corridorWidth - 1
		);
		console.log('bounds:', this.bounds);

		const top = rng.flip();
		const left = rng.flip();
		const horz = rng.flip();

		this.diggers.push(
			new Digger(
				left ? this.bounds.x1 : this.bounds.x2 - 1,
				top ? this.bounds.y1 : this.bounds.y2 - 1,
				corridorWidth,
				horz
					? left
						? Direction.Right
						: Direction.Left
					: top
					? Direction.Down
					: Direction.Up
			)
		);

		var running = true;
		while (running) {
			running = false;
			for (var i = this.diggers.length - 1; i >= 0; i--) {
				const d = this.diggers[i];
				if (d.alive) {
					d.dig(this);
					running = true;
				}
			}
		}

		this.gameMap.debug();
		while (true) {
			const x = rng.randint(1, gameMap.width - 1);
			const y = rng.randint(1, gameMap.height - 1);

			if (!gameMap.tiles[x][y].blocked) return { x, y };
		}
	}

	carve(x: number, y: number, w: number, d: Direction) {
		const tag = XYtoTag({ x, y });
		if (this.carved.has(tag)) {
			return false;
		}
		this.carved.add(tag);

		console.log('carve:', x, y);
		this.gameMap.createRoom(new Rect(x, y, w + 1, w + 1));

		return true;
	}
}
