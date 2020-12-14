import MapGenerator from './MapGenerator';
import { WeightTable } from './RNG';

export default interface Realm {
	id: string;
	name: string;
	generator: MapGenerator;
	getItemSpawnChances(floor: number): WeightTable<string>;
	getEnemySpawnChances(floor: number): WeightTable<string>;
}
