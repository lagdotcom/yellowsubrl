import ThePier from './generator/ThePier';
import Realm from './Realm';
import yaml from '../res/data/pier.yaml';
import Engine from './Engine';

export const PierRealm: Realm = {
	name: 'pier',
	generator: new ThePier(),
	load(engine: Engine) {
		engine.addPrefabs(yaml);
	},
	getItemSpawnChances() {
		return [];
	},
	getEnemySpawnChances() {
		return [
			[1, 'enemy.pier.bowlerhat'],
			[1, 'enemy.pier.eggcup'],
		];
	},
};

const realms = {
	pier: PierRealm,
};
export default realms;
