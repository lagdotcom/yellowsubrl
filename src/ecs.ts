import { diff } from 'deep-object-diff';
import { deepAssign } from 'deep-object-assign-with-reduce';
import { nanoid } from 'nanoid/non-secure';
import IAppearance from './components/Appearance';
import IFighter from './components/Fighter';
import IBlocks from './components/Blocks';
import IInventory from './components/Inventory';
import IItem from './components/Item';
import IPosition from './components/Position';
import IWeapon from './components/Weapon';
import IPlayer from './components/Player';
import IAI from './components/AI';

export class Component<T> {
	private data: { [id: string]: T };

	constructor(public name: string) {
		this.data = {};
	}

	add(en: Entity, data: T) {
		this.data[en.id] = data;
	}

	remove(en: Entity) {
		delete this.data[en.id];
	}

	get(en: Entity) {
		return this.data[en.id];
	}
}

export class Entity {
	private components: Set<Component<any>>;
	private destroyed: boolean;
	private prefabs: string[];

	constructor(private ecs: Manager, public id: string, ...prefabs: Prefab[]) {
		this.components = new Set<Component<any>>();
		this.destroyed = false;

		this.prefabs = [];
		prefabs.forEach(pf => {
			const pfd = pf.data();
			for (var name in pfd) {
				this.add(ecs.getComponent(name), deepAssign({}, pfd[name]));
			}

			this.prefabs.push(pf.id);
		});
	}

	add<T>(component: Component<T>, data: T) {
		this.components.add(component);
		component.add(this, data);
		this.ecs.update(this);

		// TODO: debugging only
		(this as any)[component.name] = data;

		return this;
	}

	get<T>(component: Component<T>): T {
		return component.get(this);
	}

	has<T>(component: Component<T>) {
		return this.components.has(component);
	}

	remove<T>(component: Component<T>) {
		this.components.delete(component);
		component.remove(this);
		this.ecs.update(this);

		// TODO: debugging only
		delete (this as any)[component.name];
	}

	data() {
		const data: { [name: string]: any } = {};
		this.components.forEach(co => {
			data[co.name] = co.get(this);
		});

		return data;
	}

	diffData() {
		return diff(this.prefabData(), this.data());
	}

	prefabNames() {
		return this.prefabs;
	}

	prefabData() {
		return deepAssign(
			{},
			...this.prefabs.map(name => this.ecs.getPrefab(name).data())
		);
	}

	destroy() {
		if (!this.destroyed) {
			this.components.forEach(comp => comp.remove(this));

			this.ecs.remove(this);
			this.destroyed = true;
		}
	}
}

export class Prefab extends Entity {}

export class Manager {
	private components: { [name: string]: Component<any> };
	private entities: Set<Entity>;
	private idGenerator: () => string;
	private prefabs: { [name: string]: Entity };
	private queries: Query[];

	constructor() {
		this.components = {};
		this.entities = new Set<Entity>();
		this.idGenerator = () => nanoid();
		this.prefabs = {};
		this.queries = [];
	}

	clear() {
		Array.from(this.entities).forEach(en => {
			this.remove(en);
		});
	}

	register<T>(name: string): Component<T> {
		const comp = new Component<T>(name);
		this.components[name] = comp;

		return comp;
	}

	getComponent<T>(name: string): Component<T> {
		const co = this.components[name];
		if (!co) throw `Unknown component: ${name}`;

		return co;
	}

	nextId() {
		return this.idGenerator();
	}

	entity(...prefabs: Prefab[]): Entity {
		const id = this.nextId();
		const en = new Entity(this, id, ...prefabs);
		return this.attach(en);
	}

	prefab(name: string, ...prefabs: Prefab[]): Prefab {
		const pf = new Prefab(this, name, ...prefabs);
		this.prefabs[name] = pf;
		return pf;
	}

	getPrefab(name: string): Prefab {
		const pf = this.prefabs[name];
		if (!pf) throw `Unknown prefab: ${name}`;

		return pf;
	}

	attach(en: Entity): Entity {
		this.entities.add(en);
		this.queries.forEach(q => q.add(en));
		return en;
	}

	update(en: Entity) {
		this.queries.forEach(q => q.add(en));
	}

	remove(en: Entity) {
		this.queries.forEach(q => q.remove(en));
		this.entities.delete(en);
	}

	query(
		{
			all,
			any,
			none,
		}: {
			all?: Component<any>[];
			any?: Component<any>[];
			none?: Component<any>[];
		} = {},
		save: boolean = true
	) {
		const matchAll = all
			? (en: Entity) => all.every(comp => en.has(comp))
			: () => true;

		const matchAny = any
			? (en: Entity) => any.some(comp => en.has(comp))
			: () => true;

		const matchNone = none
			? (en: Entity) => !none.some(comp => en.has(comp))
			: () => true;

		const query = new Query(
			Array.from(this.entities),
			en => matchAny(en) && matchAll(en) && matchNone(en)
		);

		if (save) this.queries.push(query);
		return query;
	}

	find(
		options: {
			all?: Component<any>[];
			any?: Component<any>[];
			none?: Component<any>[];
		} = {}
	) {
		return this.query(options, false).get();
	}
}

export class Query {
	private entities: Set<Entity>;

	constructor(initial: Entity[], public match: (en: Entity) => boolean) {
		this.entities = new Set(initial.filter(match));
	}

	add(en: Entity) {
		if (this.match(en)) this.entities.add(en);
		else this.entities.delete(en);
	}

	remove(en: Entity) {
		this.entities.delete(en);
	}

	get() {
		return Array.from(this.entities);
	}
}

const ecs = new Manager();
export default ecs;

// TODO: debugging only
(window as any).ecs = ecs;

export const Appearance = ecs.register<IAppearance>('Appearance');
export const AI = ecs.register<IAI>('AI');
export const Blocks = ecs.register<IBlocks>('Blocks');
export const Fighter = ecs.register<IFighter>('Fighter');
export const Inventory = ecs.register<IInventory>('Inventory');
export const Item = ecs.register<IItem>('Item');
export const Player = ecs.register<IPlayer>('Player');
export const Position = ecs.register<IPosition>('Position');
export const Weapon = ecs.register<IWeapon>('Weapon');

export const blockers = ecs.query({ all: [Blocks, Position] });
export const hasAI = ecs.query({ all: [AI] });
export const renderable = ecs.query({ all: [Appearance, Position] });
