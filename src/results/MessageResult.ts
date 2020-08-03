import Result from './Result';
import { Colours } from '../tcod';
import Engine from '../Engine';

export default class MessageResult implements Result {
	constructor(public text: string, public colour: string = Colours.white) {}

	perform(engine: Engine) {
		engine.messageLog.add(this);
		return [];
	}
}
