export function leftpad(amount: number, size: number, padding: string = ' ') {
	var s = amount.toString(10);
	while (s.length < size) s = padding + s;

	return s;
}
