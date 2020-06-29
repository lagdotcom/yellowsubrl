import { ItemUseFn } from '../components/Item';
import MessageResult from '../results/MessageResult';

export default interface ItemSpawn {
	name: string;
	colour: string;
	char: string;
	targeting?: boolean;
	targetingMessage?: MessageResult;
	use: ItemUseFn;
}
