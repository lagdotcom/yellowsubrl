import { WeaponCategory } from '../components/Weapon';
import { Colours } from '../tcod';
import ecs, { Prefab, Appearance, Weapon, Item } from '../ecs';
import { RenderOrder } from '../renderFunctions';

const instrument = (
	name: string,
	category: WeaponCategory,
	tile: string,
	colour: string
): Prefab =>
	ecs
		.prefab(name)
		.add(Appearance, { name, tile, colour, order: RenderOrder.Item })
		.add(Item, {})
		.add(Weapon, { category });

export const acoustic = instrument(
	'acoustic guitar',
	WeaponCategory.String,
	'/',
	Colours.brown
);

export const bass = instrument(
	'bass guitar',
	WeaponCategory.String,
	'/',
	Colours.black
);

export const electric = instrument(
	'electric guitar',
	WeaponCategory.String,
	'/',
	Colours.red
);

export const flute = instrument(
	'flute',
	WeaponCategory.Woodwind,
	'-',
	Colours.silver
);

export const sitar = instrument(
	'sitar',
	WeaponCategory.String,
	'\\',
	Colours.brown
);

export const snare = instrument(
	'snare drum',
	WeaponCategory.Percussion,
	'#',
	Colours.white
);

export const trombone = instrument(
	'trombone',
	WeaponCategory.Brass,
	'c',
	Colours.yellow
);

export const trumpet = instrument(
	'trumpet',
	WeaponCategory.Brass,
	'c',
	Colours.silver
);

export const tuba = instrument(
	'tuba',
	WeaponCategory.Brass,
	'U',
	Colours.yellow
);

export const violin = instrument(
	'violin',
	WeaponCategory.String,
	'_',
	Colours.brown
);
