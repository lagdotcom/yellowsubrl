import { Appearance, Fighter } from '../../components';
import ecs from '../../ecs';
import RenderOrder from '../../RenderOrder';
import Colours from '../../Colours';
import PierEnemy from './PierEnemy';

const EggcupEnemy = ecs
	.prefab('enemy.pier.eggcup', PierEnemy)
	.add(Appearance, {
		name: 'eggcup',
		tile: 'Eggcup',
		tile2: 'Eggcup2',
		colour: Colours.white,
		order: RenderOrder.Actor,
	})
	.add(Fighter, { hp: 10, xp: 1, stats: { defense: 1, power: 1, maxHp: 10 } });
export default EggcupEnemy;
