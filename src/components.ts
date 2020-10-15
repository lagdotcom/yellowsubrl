import ecs, { Entity } from './ecs';
import Result from './results/Result';
import { RenderOrder } from './renderFunctions';
import Engine from './Engine';
import MessageResult from './results/MessageResult';
import { WeightTable } from './RNG';

export interface AIRoutine {
	hurt?: (me: Entity, attacker: Entity, amount: number) => Result[];
	think: (me: Entity, engine: Engine) => Result[];
}

export type AIRoutineName = 'basic' | 'confused' | 'pierDoor' | 'pierEnemy';
export interface IAI {
	routine: AIRoutineName;
	vars: object;
}

export interface IAppearance {
	name: string;
	tile: string;
	tile2?: string;
	colour: string;
	order: RenderOrder;
	revealforever?: boolean;
	revealed?: boolean;
}

export interface IBlocks {}

export interface IDrops {
	entries: {
		chance: number;
		table: WeightTable<string>;
	}[];
}

export interface EquipmentSlots {
	head?: string;
	main?: string;
	offhand?: string;
}
export type Slot = keyof EquipmentSlots;

export interface Stats {
	defense: number;
	maxHp: number;
	power: number;
}
export type Stat = keyof Stats;

export type IEquipment = EquipmentSlots;

export interface IEquippable {
	slot: Slot;
	stats: Partial<Stats>;
}

export interface IFighter {
	hp: number;
	stats: Stats;
	xp: number;
}

export interface IInventory {
	capacity: number;
	items: { [ch: string]: string };
}

export type ItemUseFn = (
	item: Entity,
	entity: Entity,
	engine: Engine,
	x?: number,
	y?: number
) => Result[];

export interface IItem {
	use?: ItemUseFn;
	targeting?: boolean;
	targetingMessage?: MessageResult;
}

export interface IPierDoor {}

export interface IPlayer {}

export interface ILevel {
	currentLevel: number;
	currentXp: number;
	levelUpBase: number;
	levelUpFactor: number;
}

export interface IPosition {
	x: number;
	y: number;
}

export interface IStairs {
	floor: number;
}

export enum WeaponCategory {
	String,
	Brass,
	Woodwind,
	Percussion,
}

export interface IWeapon {
	category: WeaponCategory;
}

export const Appearance = ecs.register<IAppearance>('Appearance');
export const AI = ecs.register<IAI>('AI');
export const Blocks = ecs.register<IBlocks>('Blocks');
export const Drops = ecs.register<IDrops>('Drops');
export const Equipment = ecs.register<IEquipment>('Equipment');
export const Equippable = ecs.register<IEquippable>('Equippable');
export const Fighter = ecs.register<IFighter>('Fighter');
export const Inventory = ecs.register<IInventory>('Inventory');
export const Item = ecs.register<IItem>('Item');
export const Level = ecs.register<ILevel>('Level');
export const PierDoor = ecs.register<IPierDoor>('PierDoor');
export const Player = ecs.register<IPlayer>('Player');
export const Position = ecs.register<IPosition>('Position');
export const Stairs = ecs.register<IStairs>('Stairs');
export const Weapon = ecs.register<IWeapon>('Weapon');
