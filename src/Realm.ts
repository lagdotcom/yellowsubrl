import Engine from './Engine';
import MapGenerator from './MapGenerator';
import { WeightTable } from './RNG';

export type RealmName = 'pier';

export default interface Realm {
	name: RealmName;
	generator: MapGenerator;
	load(engine: Engine): void;
	getItemSpawnChances(floor: number): WeightTable<string>;
	getEnemySpawnChances(floor: number): WeightTable<string>;
}
