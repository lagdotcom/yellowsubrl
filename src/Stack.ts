export default class Stack<T> {
	private items: T[];

	constructor(...items: readonly T[]) {
		this.items = items.slice();
	}

	get size() {
		return this.items.length;
	}

	get top() {
		return this.items[this.items.length - 1];
	}

	push(...items: readonly T[]) {
		this.items.push(...items);
	}

	pop() {
		return this.items.pop();
	}

	swap(...items: readonly T[]) {
		const top = this.pop();
		this.push(...items);
		return top;
	}
}
