import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';
import Colours from './Colours';
import {
	AI,
	Appearance,
	Blocks,
	convertAppearance,
	convertFighter,
	convertWeapon,
	Drops,
	Equipment,
	Equippable,
	Fighter,
	Inventory,
	Item,
	Level,
	PierDoor,
	Player,
	Position,
	Slot,
	Stairs,
	Weapon,
	WeaponCategory,
} from './components';
import ecs from './ecs';
import RenderOrder from './RenderOrder';
import { WeightTable } from './RNG';

function isDropTable(u: unknown): u is WeightTable<string> {
	if (!Array.isArray(u)) return false;

	for (var i = 0; i < u.length; i++) {
		const n = u[i];
		if (!Array.isArray(n)) return false;

		const [weight, item] = n;
		if (!Number.isInteger(weight)) return false;
		if (typeof item !== 'string') return false;
	}

	return true;
}

const DropTableCodec = new t.Type<WeightTable<string>, string, unknown>(
	'DropTable',
	isDropTable,
	(u, c) => (isDropTable(u) ? t.success(u) : t.failure(u, c)),
	a => a.map(([weight, item]) => `${weight}/${item}`).join(', ')
);

const StatsCodec = t.type({
	defense: t.number,
	maxHp: t.number,
	power: t.number,
});

const EcsCodec = t.partial({
	prefabs: t.array(t.string),
	AI: t.type({
		routine: t.keyof({
			basic: null,
			confused: null,
			pierDoor: null,
			pierEnemy: null,
		}),
		vars: t.UnknownRecord,
	}),
	Appearance: t.intersection([
		t.type({
			name: t.string,
			tile: t.string,
			colour: t.keyof(Colours),
			order: t.keyof(RenderOrder),
		}),
		t.partial({
			tile2: t.string,
		}),
	]),
	Blocks: t.UnknownRecord,
	Drops: t.type({
		entries: t.array(
			t.type({
				chance: t.number,
				table: DropTableCodec,
			})
		),
	}),
	Equipment: t.partial({
		head: t.string,
		main: t.string,
		offhand: t.string,
	}),
	Equippable: t.type({
		slot: t.keyof(Slot),
		stats: t.partial(StatsCodec.props),
	}),
	Fighter: t.intersection([
		t.type({
			stats: StatsCodec,
		}),
		t.partial({
			xp: t.number,
		}),
	]),
	Inventory: t.type({
		capacity: t.number,
		items: t.record(t.string, t.string),
	}),
	Item: t.UnknownRecord,
	PierDoor: t.UnknownRecord,
	Player: t.UnknownRecord,
	Level: t.type({
		currentLevel: t.number,
		currentXp: t.number,
		levelUpBase: t.number,
		levelUpFactor: t.number,
	}),
	Position: t.type({
		x: t.number,
		y: t.number,
	}),
	Stairs: t.type({
		floor: t.number,
	}),
	Weapon: t.type({
		category: t.keyof(WeaponCategory),
	}),
});
type EntityData = t.TypeOf<typeof EcsCodec>;

const yamlData = require.context('../res/data', true, /\.ya?ml$/);
const yamlFiles = yamlData.keys().map(k => yamlData(k));

export default function loadAllYaml() {
	yamlFiles.forEach(docs => {
		Object.entries(docs).forEach(([id, doc]) => {
			const def = EcsCodec.decode(doc);

			if (isRight(def)) {
				loadPrefab(id, def.right);
			} else {
				console.error(
					id,
					def.left.map(e =>
						e.context
							.map(c => c.key)
							.filter(k => k)
							.join('.')
					)
				);
			}
		});
	});
}

function loadPrefab(id: string, y: EntityData) {
	const prefabs = y.prefabs ? y.prefabs : [];
	const obj = ecs.prefab(id, ...prefabs.map(prefab => ecs.getPrefab(prefab)));

	// AllComponents.forEach(comp => {
	// 	const name = comp.name;
	// 	if (y[name]) obj.add(comp, y[name]);
	// });

	if (y.AI) obj.add(AI, y.AI);
	if (y.Appearance) obj.add(Appearance, convertAppearance(y.Appearance));
	if (y.Blocks) obj.add(Blocks, y.Blocks);
	if (y.Drops) obj.add(Drops, y.Drops);
	if (y.Equipment) obj.add(Equipment, y.Equipment);
	if (y.Equippable) obj.add(Equippable, y.Equippable);
	if (y.Fighter) obj.add(Fighter, convertFighter(y.Fighter));
	if (y.Inventory) obj.add(Inventory, y.Inventory);
	if (y.Item) obj.add(Item, y.Item);
	if (y.Level) obj.add(Level, y.Level);
	if (y.PierDoor) obj.add(PierDoor, y.PierDoor);
	if (y.Player) obj.add(Player, y.Player);
	if (y.Position) obj.add(Position, y.Position);
	if (y.Stairs) obj.add(Stairs, y.Stairs);
	if (y.Weapon) obj.add(Weapon, convertWeapon(y.Weapon));
}
