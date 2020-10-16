import Realm from './Realm';

export default interface Scenario {
	description: string;
	player: string;
	realm: Realm;
	inventory: string[];
}
