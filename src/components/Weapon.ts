export enum WeaponCategory {
	String,
	Brass,
	Woodwind,
	Percussion,
}

export default class Weapon {
	constructor(public category: WeaponCategory) {}
}
