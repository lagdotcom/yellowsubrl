import { Prefab } from './ecs';
import Realm from './Realm';

export default interface Scenario {
	description: string;
	player: Prefab;
	realm: Realm;
	inventory: Prefab[];
}
