import { AI, Position } from '../components';
import ecs from '../ecs';
import { PierDoorAIVars, pierDoorPrefab } from '../features/pier';
import GameMap from '../GameMap';
import { MapGenerator } from '../MapGenerator';
import Realm from '../Realm';
import RNG from '../RNG';
import XY, { TagtoXY, XYTag, XYtoTag } from '../XY';

export default class ThePier implements MapGenerator {
	constructor(
		public corridorWidth: number = 2,
		public minGap: number = 3,
		public maxGap: number = 7,
		public minRects: number = 10,
		public maxRects: number = 20,
		public minRectSize: number = 3,
		public maxRectSize: number = 7
	) {}

	generate(realm: Realm, rng: RNG, gameMap: GameMap): XY {
		const columns = [];
		const rows = [];

		const maxCol = gameMap.width - this.corridorWidth;
		const maxRow = gameMap.height - this.corridorWidth;

		var col = rng.randint(this.minGap, this.maxGap);
		while (col < maxCol) {
			columns.push(col);
			gameMap.createVTunnel(0, gameMap.height - 1, col);
			col += this.corridorWidth + rng.randint(this.minGap, this.maxGap);
		}

		var row = rng.randint(this.minGap, this.maxGap);
		while (row < maxRow) {
			rows.push(row);
			gameMap.createHTunnel(0, gameMap.width - 1, row);
			row += this.corridorWidth + rng.randint(this.minGap, this.maxGap);
		}

		var rects = rng.randint(this.minRects, this.maxRects);
		for (var i = 0; i < rects; i++) {
			const w = rng.randint(this.minRectSize, this.maxRectSize);
			const h = rng.randint(this.minRectSize, this.maxRectSize);
			const x = rng.randint(0, gameMap.width - w);
			const y = rng.randint(0, gameMap.height - h);

			gameMap.fill(x, y, w, h, true);
		}

		gameMap.addBorder();

		// find all non-contiguous areas
		const areas: Set<XYTag>[] = [];
		for (var x = 1; x < gameMap.width - 1; x++) {
			for (var y = 1; y < gameMap.height - 1; y++) {
				if (areas.find(a => a.has(XYtoTag({ x, y })))) continue;

				if (!gameMap.tiles[x][y].blocked) {
					const area = gameMap.flood(x, y, false);
					areas.push(area);
				}
			}
		}
		areas.sort((a, b) => b.size - a.size);

		// fill in all but the biggest one
		areas.slice(1).forEach(a => {
			a.forEach(tag => {
				const xy = TagtoXY(tag);
				gameMap.tiles[xy.x][xy.y].blocked = true;
				gameMap.tiles[xy.x][xy.y].blockSight = true;
			});
		});

		// carve out the columns and place doors
		columns.forEach(x => {
			for (var y = 0; y < gameMap.height; y++) {
				if (!gameMap.tiles[x][y].blocked) {
					for (var w = 1; w < this.corridorWidth; w++) {
						gameMap.tiles[x + w][y].blocked = false;
						gameMap.tiles[x + w][y].blockSight = false;
					}
				}
			}
		});
		rows.forEach(y => {
			for (var x = 0; x < gameMap.width; x++) {
				if (!gameMap.tiles[x][y].blocked) {
					for (var w = 1; w < this.corridorWidth; w++) {
						gameMap.tiles[x][y + w].blocked = false;
						gameMap.tiles[x][y + w].blockSight = false;
					}
				}
			}
		});

		// place all valid doors
		for (var x = 0; x < gameMap.width; x++) {
			for (var y = 0; y < gameMap.height; y++) {
				if (gameMap.tiles[x][y].blocked) {
					const up = y > 0 && !gameMap.tiles[x][y - 1].blocked;
					const right =
						x < gameMap.width - 1 && !gameMap.tiles[x + 1][y].blocked;
					const down =
						y < gameMap.height - 1 && !gameMap.tiles[x][y + 1].blocked;
					const left = x > 0 && !gameMap.tiles[x - 1][y].blocked;

					if (up || right || down || left) {
						const door = ecs.entity(pierDoorPrefab).add(Position, { x, y });
						const vars = {
							directions: [],
							cooldown: rng.randint(10, 100),
						} as PierDoorAIVars;
						if (up) vars.directions.push('u');
						if (right) vars.directions.push('r');
						if (down) vars.directions.push('d');
						if (left) vars.directions.push('l');

						door.add(AI, { routine: 'pierDoor', vars });
					}
				}
			}
		}

		// TODO: a better way of generating this
		while (true) {
			const x = rng.randint(1, gameMap.width - 1);
			const y = rng.randint(1, gameMap.height - 1);

			if (!gameMap.tiles[x][y].blocked) return { x, y };
		}
	}
}
