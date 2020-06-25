import Appearance from './components/Appearance';
import Location from './components/Location';
import Weapon from './components/Weapon';
import Fighter from './components/Fighter';
import { Map } from './tcod';
import GameMap from './GameMap';
import Result from './results/Result';

export type HasAI = Entity & { ai: AI };
interface AI {
	takeTurn(
		me: Entity,
		target: Entity,
		fovMap: Map,
		gameMap: GameMap,
		entities: Entity[]
	): Result[];
}

export default class Entity {
	name: string;
	ai?: AI;
	appearance?: Appearance;
	fighter?: Fighter;
	location?: Location;
	weapon?: Weapon;

	constructor({
		name,
		ai,
		appearance,
		fighter,
		location,
		weapon,
	}: {
		name: string;
		ai?: AI;
		appearance?: Appearance;
		fighter?: Fighter;
		location?: Location;
		weapon?: Weapon;
	}) {
		this.name = name;
		this.ai = ai;
		this.appearance = appearance;
		this.fighter = fighter;
		this.location = location;
		this.weapon = weapon;
	}
}

export function getBlockingEntitiesAtLocation(
	entities: Entity[],
	x: number,
	y: number
) {
	return entities.find(
		e =>
			e.location && e.location.blocks && e.location.x == x && e.location.y == y
	);
}
