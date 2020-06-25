import Appearance from './components/Appearance';
import Location from './components/Location';
import Weapon from './components/Weapon';

export default class Entity {
	name: string;
	appearance?: Appearance;
	location?: Location;
	weapon?: Weapon;

	constructor({
		name,
		appearance,
		location,
		weapon,
	}: {
		name: string;
		appearance?: Appearance;
		location?: Location;
		weapon?: Weapon;
	}) {
		this.name = name;
		this.appearance = appearance;
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
