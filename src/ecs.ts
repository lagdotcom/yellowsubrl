import { diff } from 'deep-object-diff';
import { nanoid } from 'nanoid/non-secure';
import merge from 'lodash.merge';

export class Component<T> {
	private data: { [id: string]: T };

	constructor(public name: string) {
		this.data = {};
	}

	add(en: BaseEntity, data: T) {
		this.data[en.id] = data;
	}

	remove(en: BaseEntity) {
		delete this.data[en.id];
	}

	get(en: BaseEntity) {
		return this.data[en.id];
	}
}

abstract class BaseEntity {
	protected components: Set<Component<any>>;
	protected prefabs: string[];

	constructor(
		protected ecs: Manager,
		public id: string,
		...prefabs: readonly Prefab[]
	) {
		this.components = new Set<Component<any>>();

		this.prefabs = [];
		prefabs.forEach(pf => {
			const pfd = pf.data();
			for (var name in pfd) {
				this.add(ecs.getComponent(name), pfd[name]);
			}

			this.prefabs.push(pf.id);
		});
	}

	add<T>(component: Component<T>, data: T) {
		this.components.add(component);
		component.add(this, merge({}, data));

		// TODO: debugging only
		(this as any)[component.name] = component.get(this);

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
		return merge(
			{},
			...this.prefabs.map(name => this.ecs.getPrefab(name).data())
		);
	}
}

export class Entity extends BaseEntity {
	private destroyed: boolean;

	constructor(ecs: Manager, id: string, ...prefabs: readonly Prefab[]) {
		super(ecs, id, ...prefabs);
		this.destroyed = false;
	}

	add<T>(component: Component<T>, data: T) {
		super.add(component, data);
		this.ecs.update(this);

		return this;
	}

	remove<T>(component: Component<T>) {
		super.remove(component);
		this.ecs.update(this);
	}

	destroy() {
		if (!this.destroyed) {
			this.components.forEach(comp => comp.remove(this));

			this.ecs.remove(this);
			this.destroyed = true;
		}
	}
}

export class Prefab extends BaseEntity {}

export class Manager {
	private components: { [name: string]: Component<any> };
	private entities: Set<Entity>;
	private idGenerator: () => string;
	private prefabs: { [name: string]: Prefab };
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

	getEntity(id: string) {
		return [...this.entities].find(en => en.id == id);
	}

	getComponent<T>(name: string): Component<T> {
		const co = this.components[name];
		if (!co) throw `Unknown component: ${name}`;

		return co;
	}

	nextId() {
		return this.idGenerator();
	}

	entity(...prefabs: readonly string[]): Entity {
		const id = this.nextId();
		const en = new Entity(
			this,
			id,
			...prefabs.map(name => this.getPrefab(name))
		);
		return this.attach(en);
	}

	prefab(name: string, ...prefabs: readonly Prefab[]): Prefab {
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
			all?: readonly Component<any>[];
			any?: readonly Component<any>[];
			none?: readonly Component<any>[];
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
			all?: readonly Component<any>[];
			any?: readonly Component<any>[];
			none?: readonly Component<any>[];
		} = {}
	) {
		return this.query(options, false).get();
	}
}

export class Query {
	private entities: Set<Entity>;

	constructor(
		initial: readonly Entity[],
		public match: (en: Entity) => boolean
	) {
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
