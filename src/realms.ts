import ThePier from './generator/ThePier';
import Realm from './Realm';

export const PierRealm: Realm = {
	name: 'pier',
	generator: new ThePier(),
	getItemSpawnChances() {
		return [];
	},
	getEnemySpawnChances() {
		return [];
	},
};

const realms = {
	pier: PierRealm,
};
export default realms;
