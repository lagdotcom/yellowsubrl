import Result from './Result';
import { Colours } from '../tcod';
import Engine from '../Engine';

export default class MessageResult implements Result {
	name: 'message';
	constructor(public text: string, public colour: string = Colours.white) {
		this.name = 'message';
	}

	perform(engine: Engine) {
		engine.messageLog.add(this);
		return [];
	}
}
