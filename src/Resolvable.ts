type Returns<T> = () => T;
type Resolvable<T> = T | Returns<T>;

export default Resolvable;

export function resolve<T>(x: Resolvable<T>) {
	return typeof x === 'function' ? (x as Returns<T>)() : x;
}
