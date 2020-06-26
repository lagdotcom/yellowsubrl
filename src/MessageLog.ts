import MessageResult from './results/MessageResult';

export default class MessageLog {
	messages: MessageResult[];

	constructor(public x: number, public width: number, public height: number) {
		this.messages = [];
	}

	add(msg: MessageResult) {
		this.split(msg).forEach(line => {
			if (this.messages.length >= this.height) this.messages.shift();
			this.messages.push(new MessageResult(line, msg.colour));
		});
	}

	split(msg: MessageResult) {
		// TODO: wrap nicer

		const lines: string[] = [];
		var current = '';

		for (var i = 0; i < msg.text.length; i++) {
			current += msg.text[i];

			if (current.length >= this.width) {
				lines.push(current);
				current = '';
			}
		}

		if (current) lines.push(current);
		return lines;
	}
}
