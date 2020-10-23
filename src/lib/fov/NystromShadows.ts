// translated from http://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/

import TileMap from '../TileMap';

class Vec {
	constructor(public x: number, public y: number) {}

	add(other: Vec) {
		return new Vec(this.x + other.x, this.y + other.y);
	}
}

class ShadowLine {
	constructor(public shadows: Shadow[] = []) {}

	add(shadow: Shadow) {
		// Figure out where to slot the new shadow in the list.
		for (var index = 0; index < this.shadows.length; index++) {
			// Stop when we hit the insertion point.
			if (this.shadows[index].start >= shadow.start) break;
		}

		// The new shadow is going here. See if it overlaps the
		// previous or next.
		var overlappingPrevious;
		if (index > 0 && this.shadows[index - 1].end > shadow.start) {
			overlappingPrevious = this.shadows[index - 1];
		}

		var overlappingNext;
		if (index < this.shadows.length && this.shadows[index].start < shadow.end) {
			overlappingNext = this.shadows[index];
		}

		// Insert and unify with overlapping shadows.
		if (overlappingNext != null) {
			if (overlappingPrevious != null) {
				// Overlaps both, so unify one and delete the other.
				overlappingPrevious.end = overlappingNext.end;
				this.shadows.splice(index, 1);
			} else {
				// Overlaps the next one, so unify it with that.
				overlappingNext.start = shadow.start;
			}
		} else {
			if (overlappingPrevious != null) {
				// Overlaps the previous one, so unify it with that.
				overlappingPrevious.end = shadow.end;
			} else {
				// Does not overlap anything, so insert.
				this.shadows.splice(index, 0, shadow);
			}
		}
	}

	isInShadow(projection: Shadow) {
		for (var i = 0; i < this.shadows.length; i++) {
			if (this.shadows[i].contains(projection)) return true;
		}

		return false;
	}

	get isFullShadow() {
		return (
			this.shadows.length == 1 &&
			this.shadows[0].start <= 0 &&
			this.shadows[0].end >= 1
		);
	}
}

class Shadow {
	constructor(public start: number, public end: number) {}

	contains(other: Shadow) {
		return this.start <= other.start && this.end >= other.end;
	}
}

type octant = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function refreshVisibility(
	map: TileMap,
	x: number,
	y: number,
	radius: number,
	lightWalls: boolean
) {
	map.tiles[x][y].inFov = true;

	const hero = new Vec(x, y);
	for (var oct: octant = 0; oct < 8; oct++)
		refreshOctant(map, hero, oct as octant, radius, lightWalls);
}

function transformOctant(row: number, col: number, oct: octant) {
	switch (oct) {
		case 0:
			return new Vec(col, -row);
		case 1:
			return new Vec(row, -col);
		case 2:
			return new Vec(row, col);
		case 3:
			return new Vec(col, row);
		case 4:
			return new Vec(-col, row);
		case 5:
			return new Vec(-row, col);
		case 6:
			return new Vec(-row, -col);
		case 7:
			return new Vec(-col, -row);
	}
}

function refreshOctant(
	map: TileMap,
	hero: Vec,
	oct: octant,
	radius: number,
	lightWalls: boolean
) {
	const line = new ShadowLine();
	var fullShadow = false;

	// TODO: gives square vision, not circular
	for (var row = 1; row < radius; row++) {
		// Stop once we go out of bounds.
		const rpos = hero.add(transformOctant(row, 0, oct));
		if (!map.contains(rpos.x, rpos.y)) break;

		for (var col = 0; col <= row; col++) {
			const pos = hero.add(transformOctant(row, col, oct));

			// If we've traversed out of bounds, bail on this row.
			if (!map.contains(pos.x, pos.y)) break;

			if (fullShadow) {
				map.tiles[pos.x][pos.y].inFov = false;
			} else {
				const projection = projectTile(row, col);

				// Set the visibility of this tile.
				const visible = !line.isInShadow(projection);
				const t = map.tiles[pos.x][pos.y];

				if (visible) t.inFov = lightWalls || t.allowSight;

				var blocked = false;
				// Add any opaque tiles to the shadow map.
				if (visible && !t.allowSight) {
					line.add(projection);
					fullShadow = line.isFullShadow;

					blocked = true;
				}

				const flags = [];
				if (visible) flags.push('vis');
				if (blocked) flags.push('blk');
			}
		}
	}
}

function projectTile(row: number, col: number) {
	const topLeft = col / (row + 2);
	const bottomRight = (col + 1) / (row + 1);
	return new Shadow(topLeft, bottomRight);
}
