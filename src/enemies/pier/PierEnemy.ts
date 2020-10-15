import { AI, Blocks } from '../../components';
import ecs from '../../ecs';

const PierEnemy = ecs
	.prefab('enemy.pier')
	.add(Blocks, {})
	.add(AI, { routine: 'pierEnemy', vars: {} });
export default PierEnemy;
