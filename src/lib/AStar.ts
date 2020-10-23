import TileMap from './TileMap';

type coord = { x: number; y: number; key: string };
type heuristic = (a: coord, b: coord) => number;

const at = (x: number, y: number): coord => ({ x, y, key: `${x},${y}` });

function defaultHeuristic(a: coord, b: coord) {
	const { x: x1, y: y1 } = a;
	const { x: x2, y: y2 } = b;
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

class GridGraph {
	constructor(public map: TileMap) {}

	contains(co: coord) {
		return this.map.contains(co.x, co.y);
	}

	passable(co: coord) {
		const t = this.map.tiles[co.x][co.y];
		return t.allowMove;
	}

	neighbours(co: coord, diagonalCost: number) {
		const { x, y } = co;
		var choices: [co: coord, cost: number][] = [
			[at(x, y - 1), 1],
			[at(x - 1, y), 1],
			[at(x + 1, y), 1],
			[at(x, y + 1), 1],
		];

		if (diagonalCost != 0)
			choices.push(
				[at(x - 1, y - 1), diagonalCost],
				[at(x + 1, y - 1), diagonalCost],
				[at(x - 1, y + 1), diagonalCost],
				[at(x + 1, y + 1), diagonalCost]
			);

		// aesthetics!
		if ((x + y) % 2) choices.reverse();

		return choices.filter(
			([ch, cost]) => this.contains(ch) && this.passable(ch)
		);
	}
}

class CoordQueue {
	items: { co: coord; pri: number }[];

	constructor() {
		this.items = [];
	}

	put(co: coord, pri: number) {
		const item = this.items.find(it => it.co.key == co.key);
		if (item) item.pri = pri;
		else {
			this.items.push({ co, pri });
		}
	}

	empty() {
		return this.items.length === 0;
	}

	get() {
		if (!this.items.length) throw 'Queue empty';

		this.items.sort((a, b) => a.pri - b.pri);
		return this.items.shift()!.co;
	}
}

export default class AStar {
	constructor(
		public map: TileMap,
		public diagonalCost: number,
		public heuristic: heuristic = defaultHeuristic
	) {}

	public getPath(x1: number, y1: number, x2: number, y2: number) {
		const start = at(x1, y1);
		const goal = at(x2, y2);
		const graph = new GridGraph(this.map);
		const { cameFrom } = this.search(graph, start, goal);

		if (cameFrom[goal.key]) {
			var co = goal;
			var path = [];
			while (cameFrom[co.key]) {
				path.unshift([co.x, co.y]);
				co = cameFrom[co.key];
			}

			return path;
		}
	}

	private search(graph: GridGraph, start: coord, goal: coord) {
		const frontier = new CoordQueue();
		frontier.put(start, 0);
		const cameFrom: { [key: string]: coord } = {};
		const costSoFar: { [key: string]: number } = {};
		costSoFar[start.key] = 0;

		while (!frontier.empty()) {
			const current = frontier.get();
			if (current.key == goal.key) break;

			graph.neighbours(current, this.diagonalCost).forEach(([next, cost]) => {
				const newCost = costSoFar[current.key] + cost;
				if (!(next.key in costSoFar) || newCost < costSoFar[next.key]) {
					costSoFar[next.key] = newCost;
					const priority = newCost + this.heuristic(goal, next);
					frontier.put(next, priority);
					cameFrom[next.key] = current;
				}
			});
		}

		return { cameFrom, costSoFar };
	}
}
