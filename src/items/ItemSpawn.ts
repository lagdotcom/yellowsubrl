import { ItemUseFn } from '../components/Item';
import MessageResult from '../results/MessageResult';
import { WeaponCategory } from '../components/Weapon';

export default interface ItemSpawn {
	name: string;
	colour: string;
	ch: string;
	targeting?: boolean;
	targetingMessage?: MessageResult;
	use?: ItemUseFn;
	weapon?: WeaponCategory;
}
