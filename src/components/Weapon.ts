import Entity from '../Entity';

export enum WeaponCategory {
	String,
	Brass,
	Woodwind,
	Percussion,
}

export type HasWeapon = Entity & { weapon: Weapon };

export default class Weapon {
	constructor(public category: WeaponCategory) {}
}
