import Tile from './Tile';

export default class GameMap {
	width: number;
	height: number;
	tiles: Tile[][];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;

		this.tiles = this.initializeTiles();
	}

	public isBlocked(x: number, y: number) {
		if (this.tiles[x][y].blocked) return true;

		return false;
	}

	private initializeTiles() {
		const tiles: Tile[][] = [];

		for (var x = 0; x < this.width; x++) {
			const col: Tile[] = [];

			for (var y = 0; y < this.height; y++) col.push(new Tile(false));

			tiles.push(col);
		}

		tiles[30][22].blocked = true;
		tiles[30][22].block_sight = true;
		tiles[31][22].blocked = true;
		tiles[31][22].block_sight = true;
		tiles[32][22].blocked = true;
		tiles[32][22].block_sight = true;

		return tiles;
	}
}
