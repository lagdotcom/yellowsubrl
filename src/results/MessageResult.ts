import Result from './Result';

export default class MessageResult implements Result {
	constructor(public text: string) {}

	perform() {
		console.log('message', this.text);
		return [];
	}
}
