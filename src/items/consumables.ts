import { Colours } from '../tcod';
import {
	heal,
	castFireball,
	castLightning,
	castConfuse,
} from '../itemFunctions';
import MessageResult from '../results/MessageResult';
import ecs from '../ecs';
import { RenderOrder } from '../renderFunctions';
import { Appearance, Item } from '../components';

export const healingPotion = ecs
	.prefab('healing potion')
	.add(Appearance, {
		name: 'healing potion',
		tile: 'Potion',
		tile2: 'Potion2',
		colour: Colours.violet,
		order: RenderOrder.Item,
		revealforever: true,
	})
	.add(Item, { use: (item, en) => heal({ item, en, amount: 4 }) });

export const fireballScroll = ecs
	.prefab('fireball scroll')
	.add(Appearance, {
		name: 'fireball scroll',
		tile: 'Scroll',
		tile2: 'Scroll2',
		colour: Colours.red,
		order: RenderOrder.Item,
		revealforever: true,
	})
	.add(Item, {
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
	});

export const lightningScroll = ecs
	.prefab('lightning scroll')
	.add(Appearance, {
		name: 'lightning scroll',
		tile: 'Scroll',
		tile2: 'Scroll2',
		colour: Colours.yellow,
		order: RenderOrder.Item,
		revealforever: true,
	})
	.add(Item, {
		use: (item, caster, engine) =>
			castLightning({
				item,
				caster,
				fovMap: engine.fovMap,
				damage: 20,
				range: 5,
			}),
	});

export const confusionScroll = ecs
	.prefab('confusion scroll')
	.add(Appearance, {
		name: 'confusion scroll',
		tile: 'Scroll',
		tile2: 'Scroll2',
		colour: Colours.lightPink,
		order: RenderOrder.Item,
		revealforever: true,
	})
	.add(Item, {
		targeting: true,
		targetingMessage: new MessageResult(
			'Left-click an enemy to confuse it, or Esc to cancel.',
			Colours.lightCyan
		),
		use: (item, caster, engine, x, y) =>
			castConfuse(item, caster, engine.fovMap, 10, { x: x!, y: y! }),
	});
