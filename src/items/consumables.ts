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
	char: '!',
	use: (item, en) => heal({ item, en, amount: 4 }),
};

export const fireballScroll: ItemSpawn = {
	name: 'fireball scroll',
	colour: Colours.red,
	char: '#',
	targeting: true,
	targetingMessage: new MessageResult(
		'Left-click a target tile for the fireball, or Esc to cancel.',
		Colours.lightCyan
	),
	use: (item, caster, engine, x, y) =>
		castFireball({
			item,
			caster,
			entities: engine.entities,
			fovMap: engine.fovMap,
			damage: 12,
			radius: 3,
			targetX: x!,
			targetY: y!,
		}),
};

export const lightningScroll: ItemSpawn = {
	name: 'lightning scroll',
	colour: Colours.yellow,
	char: '#',
	use: (item, caster, engine) =>
		castLightning({
			item,
			caster,
			entities: engine.entities,
			fovMap: engine.fovMap,
			damage: 20,
			range: 5,
		}),
};

export const confusionScroll: ItemSpawn = {
	name: 'confusion scroll',
	colour: Colours.lightPink,
	char: '#',
	targeting: true,
	targetingMessage: new MessageResult(
		'Left-click an enemy to confuse it, or Esc to cancel.',
		Colours.lightCyan
	),
	use: (item, caster, engine, x, y) =>
		castConfuse(item, caster, engine.entities, engine.fovMap, 10, x!, y!),
};
