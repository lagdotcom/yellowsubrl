import ThePier from './generator/ThePier';
import Realm from './Realm';
import realmYaml from '../res/realms.yaml';
import { WeightTable } from './RNG';

const RealmGenerators = {
	pier: ThePier,
};

const realms: { [id: string]: Realm } = {};
export default realms;

interface YRealm {
	name: string;
	generator: keyof typeof RealmGenerators;
	items: WeightTable<string>;
	enemies: WeightTable<string>;
}
type YRealms = { [id: string]: YRealm };

Object.entries(realmYaml as YRealms).forEach(([id, realm]) => {
	realms[id] = {
		name: realm.name,
		generator: new RealmGenerators[realm.generator](),
		getItemSpawnChances() {
			return realm.items;
		},
		getEnemySpawnChances() {
			return realm.enemies;
		},
	};
});
