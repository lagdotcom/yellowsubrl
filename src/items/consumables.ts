import ItemSpawn from './ItemSpawn';
import { Colours } from '../tcod';
import {
	heal,
	castFireball,
	castLightning,
	castConfuse,
} from '../itemFunctions';
import MessageResult from '../results/MessageResult';

export const healingPotion: ItemSpawn = {
	name: 'healing potion',
	colour: Colours.violet,
	ch: '!',
	use: (item, en) => heal({ item, en, amount: 4 }),
};

export const fireballScroll: ItemSpawn = {
	name: 'fireball scroll',
	colour: Colours.red,
	ch: '#',
	targeting: true,
	targetingMessage: new MessageResult(
		'Left-click a target tile for the fireball, or Esc to cancel.',
		Colours.lightCyan
	),
	use: (item, caster, engine, x, y) =>
		castFireball({
			item,
			caster,
			fovMap: engine.fovMap,
			damage: 12,
			radius: 3,
			target: { x: x!, y: y! },
		}),
};

export const lightningScroll: ItemSpawn = {
	name: 'lightning scroll',
	colour: Colours.yellow,
	ch: '#',
	use: (item, caster, engine) =>
		castLightning({
			item,
			caster,
			fovMap: engine.fovMap,
			damage: 20,
			range: 5,
		}),
};

export const confusionScroll: ItemSpawn = {
	name: 'confusion scroll',
	colour: Colours.lightPink,
	ch: '#',
	targeting: true,
	targetingMessage: new MessageResult(
		'Left-click an enemy to confuse it, or Esc to cancel.',
		Colours.lightCyan
	),
	use: (item, caster, engine, x, y) =>
		castConfuse(item, caster, engine.fovMap, 10, { x: x!, y: y! }),
};
