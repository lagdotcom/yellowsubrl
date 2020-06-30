export enum WeaponCategory {
	String,
	Brass,
	Woodwind,
	Percussion,
}

export default interface IWeapon {
	category: WeaponCategory;
}
