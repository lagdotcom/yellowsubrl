import { Appearance, Fighter, Drops, Equippable, Item } from '../../components';
import ecs from '../../ecs';
import { RenderOrder } from '../../renderFunctions';
import { Colours } from '../../tcod';
import PierEnemy from './PierEnemy';

const BowlerHatEnemy = ecs
	.prefab('enemy.pier.bowlerhat', PierEnemy)
	.add(Appearance, {
		name: 'bowler hat',
		tile: 'BowlerHat',
		tile2: 'BowlerHat2',
		colour: Colours.black,
		order: RenderOrder.Actor,
	})
	.add(Fighter, {
		hp: 4,
		xp: 1,
		stats: { defense: 0, power: 2, maxHp: 4 },
	})
	.add(Drops, {
		entries: [
			{
				chance: 100,
				table: [
					[5, 'corpse.bowlerhat'],
					[1, 'item.bowlerhat'],
				],
			},
		],
	});
export default BowlerHatEnemy;

const BowlerHat = ecs
	.prefab('item.bowlerhat')
	.add(Appearance, {
		name: 'bowler hat',
		tile: '^',
		colour: Colours.black,
		order: RenderOrder.Item,
	})
	.add(Item, {})
	.add(Equippable, { slot: 'head', stats: { defense: 1 } });

const DeadBowlerHat = ecs.prefab('corpse.bowlerhat').add(Appearance, {
	name: 'dented bowler hat',
	tile: '^',
	colour: Colours.grey,
	order: RenderOrder.Corpse,
});
