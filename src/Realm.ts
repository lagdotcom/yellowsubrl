import { Prefab } from './ecs';
import MapGenerator from './MapGenerator';
import { WeightTable } from './RNG';

export type RealmName = 'pier';

export default interface Realm {
	name: RealmName;
	generator: MapGenerator;
	getItemSpawnChances(floor: number): WeightTable<Prefab>;
	getEnemySpawnChances(floor: number): WeightTable<Prefab>;
}
