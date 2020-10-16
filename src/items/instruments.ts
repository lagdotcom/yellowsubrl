import { Colours } from '../tcod';
import ecs, { Prefab } from '../ecs';
import RenderOrder from '../RenderOrder';
import {
	Appearance,
	Item,
	Weapon,
	WeaponCategory,
	Equippable,
} from '../components';

const instrument = ecs
	.prefab('item.instrument')
	.add(Item, {})
	.add(Equippable, { slot: 'main', stats: {} });

const makeInstrumentPrefab = (
	name: string,
	category: WeaponCategory,
	tile: string,
	colour: string
): Prefab =>
	ecs
		.prefab(name, instrument)
		.add(Appearance, {
			name,
			tile,
			tile2: tile + '2',
			colour,
			order: RenderOrder.Item,
			revealforever: true,
		})
		.add(Weapon, { category });

export const acoustic = makeInstrumentPrefab(
	'acoustic guitar',
	WeaponCategory.String,
	'Guitar',
	Colours.brown
);

export const bass = makeInstrumentPrefab(
	'bass guitar',
	WeaponCategory.String,
	'Guitar',
	Colours.black
);

export const electric = makeInstrumentPrefab(
	'electric guitar',
	WeaponCategory.String,
	'Guitar',
	Colours.red
);

export const flute = makeInstrumentPrefab(
	'flute',
	WeaponCategory.Woodwind,
	'Flute',
	Colours.silver
);

export const sitar = makeInstrumentPrefab(
	'sitar',
	WeaponCategory.String,
	'\\',
	Colours.brown
);

export const snare = makeInstrumentPrefab(
	'snare drum',
	WeaponCategory.Percussion,
	'Drum',
	Colours.white
);

export const trombone = makeInstrumentPrefab(
	'trombone',
	WeaponCategory.Brass,
	'c',
	Colours.yellow
);

export const trumpet = makeInstrumentPrefab(
	'trumpet',
	WeaponCategory.Brass,
	'c',
	Colours.silver
);

export const tuba = makeInstrumentPrefab(
	'tuba',
	WeaponCategory.Brass,
	'U',
	Colours.yellow
);

export const violin = makeInstrumentPrefab(
	'violin',
	WeaponCategory.String,
	'_',
	Colours.brown
);
