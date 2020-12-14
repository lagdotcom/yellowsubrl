import GameMap from './GameMap';
import MapGenerator from './MapGenerator';
import Colours from './Colours';
import Terminal, { TerminalKey, TerminalMouse } from './lib/Terminal';
import TileConsole from './lib/TileConsole';
import TileMap, { FovAlgorithm } from './lib/TileMap';
import Tileset from './lib/Tileset';
import GameState from './GameState';
import { initializeFov, recomputeFov } from './systems/fov';
import RNG, { toReadable, fromReadable } from './RNG';
import {
	clearAll,
	ColourMap,
	drawMessageLog,
	renderAll,
} from './renderFunctions';
import Result from './results/Result';
import MessageLog from './MessageLog';
import { handleKeys, handleMouse } from './inputHandlers';
import Stack from './Stack';
import ecs, { Entity } from './ecs';
import {
	barWidth,
	colours,
	fovAlgorithm,
	fovLightWalls,
	fovRadius,
	height,
	mapDisplayHeight,
	mapDisplayWidth,
	mapHeight,
	mapWidth,
	messageHeight,
	messageWidth,
	messageX,
	panelHeight,
	width,
} from './constants';
import MessageResult from './results/MessageResult';
import { mainMenu, setupMenu } from './menus';
import {
	AI,
	Appearance,
	Blocks,
	convertAppearance,
	convertFighter,
	convertWeapon,
	Drops,
	EntityDataTable,
	Equipment,
	Equippable,
	Fighter,
	Inventory,
	Item,
	Level,
	PierDoor,
	Player,
	Position,
	Stairs,
	Weapon,
} from './components';
import { hasAI } from './queries';
import merge from 'lodash.merge';
import ItemAddedResult from './results/ItemAddedResult';
import EquipItemResult from './results/EquipItemResult';
import { isAlive } from './systems/combat';
import { AIRoutines } from './systems/ai';
import Scenario from './Scenario';
import Realm from './Realm';
import realms from './realms';

const yamlData = require.context('../res/data', true, /\.ya?ml$/);
const yamlFiles: EntityDataTable[] = yamlData.keys().map(k => yamlData(k));

interface SaveData {
	entities: { [id: string]: [templates: string[], args: any] };
	explored: string[];
	map: string;
	seed: string;
	floor: number;
	realm: string;
}

export default class Engine {
	public barWidth: number;
	public colours: ColourMap;
	public console: TileConsole;
	public context: Terminal;
	public fovAlgorithm: FovAlgorithm;
	public fovLightWalls: boolean;
	public fovMap: TileMap;
	public fovRadius: number;
	public fovRecompute!: boolean;
	public gameMap: GameMap;
	public gameStateStack: Stack<GameState>;
	public height: number;
	public mapGenerator?: MapGenerator;
	public mapHeight: number;
	public mapWidth: number;
	public messageLog: MessageLog;
	public mouseX: number;
	public mouseY: number;
	public panel: TileConsole;
	public panelHeight: number;
	public panelY: number;
	public player!: Entity;
	public realm?: Realm;
	public rng: RNG;
	public scrollX: number;
	public scrollY: number;
	public targetingItem?: Entity;
	public tilesets: readonly Tileset[];
	public width: number;

	private fpsString: string;
	private frames: number;
	private lastReportTime: number;

	constructor(tilesets: readonly Tileset[]) {
		// TODO: debugging only
		(window as any).G = this;

		this.colours = colours;
		this.rng = new RNG();
		this.tilesets = tilesets;

		this.mapHeight = mapHeight;
		this.mapWidth = mapWidth;
		this.gameMap = new GameMap(this.rng.seed, mapWidth, mapHeight, 1);

		const tileset = tilesets[0];
		this.context = new Terminal(
			width * tileset.tileWidth,
			height * tileset.tileHeight,
			tileset.tileWidth,
			tileset.tileHeight
		);
		this.context.listen('keydown', 'mousemove', 'mousedown');
		this.mouseX = 0;
		this.mouseY = 0;

		this.height = height;
		this.width = width;
		this.console = new TileConsole(width, height, tileset);
		this.scrollX = 0;
		this.scrollY = 0;

		this.barWidth = barWidth;
		this.panelHeight = panelHeight;
		this.panelY = height - panelHeight;
		this.panel = new TileConsole(width, panelHeight, tileset);

		this.messageLog = new MessageLog(messageX, messageWidth, messageHeight);

		this.fpsString = '';
		this.frames = 0;
		this.gameStateStack = new Stack(GameState.MainMenu);
		this.lastReportTime = new Date().getTime();

		this.fovAlgorithm = fovAlgorithm;
		this.fovLightWalls = fovLightWalls;
		this.fovRadius = fovRadius;
		this.fovMap = initializeFov(this.gameMap);

		this.resolve = this.resolve.bind(this);
		this.main = this.main.bind(this);
		yamlFiles.forEach(y => this.addPrefabs(y));
	}

	get gameState() {
		return this.gameStateStack.top;
	}

	newGame(scen: Scenario) {
		this.gameStateStack.swap(GameState.PlayerTurn);
		this.player = ecs.entity(scen.player);
		this.realm = realms[scen.realm];
		this.mapGenerator = this.realm!.generator;
		this.newMap();

		scen.inventory.forEach((prefab, i) => {
			const item = ecs.entity(prefab);
			new ItemAddedResult(
				this.player,
				item,
				String.fromCharCode(97 + i)
			).perform();
			if (item.has(Equippable))
				new EquipItemResult(this.player, item).perform();
		});
	}

	saveGame() {
		if (!this.realm) {
			throw new Error('Realm not set.');
		}

		const data: SaveData = {
			entities: {},
			explored: this.gameMap.getExplored(),
			seed: toReadable(this.rng.seed),
			map: toReadable(this.gameMap.seed),
			floor: this.gameMap.floor,
			realm: this.realm.name,
		};
		ecs.find().forEach(en => {
			data.entities[en.id] = [en.prefabNames(), en.diffData()];
		});

		localStorage.setItem(
			'ysrl.save',
			JSON.stringify(data, (_, v) => (v === undefined ? null : v))
		);
	}

	loadGame() {
		const raw = localStorage.getItem('ysrl.save');
		if (!raw) return this.messageLog.add(new MessageResult('No game to load!'));
		const data = JSON.parse(raw) as SaveData;

		this.gameMap.reset(
			fromReadable(data.map),
			this.gameMap.width,
			this.gameMap.height,
			data.floor
		);
		this.rng.seed = this.gameMap.seed;

		const realm = realms[data.realm];
		this.realm = realm;
		this.mapGenerator = realm.generator;
		realm.generator.generate(realm, this.rng, this.gameMap);
		this.gameMap.reveal(data.explored);
		ecs.clear();

		for (const id in data.entities) {
			const [eprefabs, edata] = data.entities[id];
			const en = new Entity(
				ecs,
				id,
				...eprefabs.map(name => ecs.getPrefab(name))
			);
			ecs.attach(en);

			for (const name in edata) {
				const co = ecs.getComponent(name);
				const cdata = edata[name];

				if (cdata === null) {
					en.remove(co);
				} else if (en.has(co)) {
					merge(en.get(co), cdata);
				} else {
					en.add(co, cdata);
				}
			}
		}

		this.rng.seed = fromReadable(data.seed);
		this.player = ecs.find({ all: [Player] })[0];
		if (!this.player) throw 'No player in save game';

		this.fovMap = initializeFov(this.gameMap);
		this.messageLog.add(new MessageResult('Game loaded!'));
		this.gameStateStack.swap(GameState.PlayerTurn);

		this.updateScroll();
	}

	refresh() {
		this.fovRecompute = true;
		this.console.clear();
	}

	changeFont() {
		const i = this.tilesets.indexOf(this.console.tileset);
		const j = (i + 1) % this.tilesets.length;
		const tileset = this.tilesets[j];

		this.console.setTileset(tileset);
		this.panel.setTileset(tileset);
		this.fovRecompute = true;
	}

	newMap() {
		const { gameMap, mapGenerator, realm, rng } = this;
		if (!realm) {
			throw new Error('Realm not set.');
		}
		if (!mapGenerator) {
			throw new Error('Map Generator not set.');
		}

		// remove all items on the dungeon floor
		ecs
			.query({ all: [Position] }, false)
			.get()
			.forEach(e => e.destroy());

		gameMap.reset(rng.seed, gameMap.width, gameMap.height, gameMap.floor);
		const start = mapGenerator.generate(realm, rng, gameMap);

		this.fovMap = initializeFov(gameMap);

		this.player.add(Position, { ...start });

		this.updateScroll();
	}

	start() {
		this.context.main(this.main);
	}

	private main() {
		if (this.gameState == GameState.MainMenu) {
			mainMenu(this.console, width, height);
			drawMessageLog(this.messageLog, this.console, 30);
			this.context.present(this.console);

			const { key } = this.context.checkForEvents();
			this.update(key);
			return;
		}

		if (this.gameState == GameState.ChoosingSetup) {
			setupMenu(this.console, width, height);
			drawMessageLog(this.messageLog, this.console, 30);
			this.context.present(this.console);

			const { key } = this.context.checkForEvents();
			this.update(key);
			return;
		}

		this.gameMain();
	}

	private gameMain() {
		const { key, mouse } = this.context.checkForEvents();
		this.update(key, mouse);
		this.render(this.context);
		this.enemyActions();
	}

	private update(key?: TerminalKey, mouse?: TerminalMouse) {
		if (mouse) {
			[this.mouseX, this.mouseY] = [mouse.x, mouse.y];

			this.mouseX = this.scrollX + Math.floor(mouse.x / 2);
			this.mouseY = this.scrollY + mouse.y;
		}

		const kaction = handleKeys(this.gameState, key);
		if (kaction) kaction.perform(this, this.player).forEach(this.resolve);

		const maction = handleMouse(this.gameState, mouse);
		if (maction) maction.perform(this, this.player).forEach(this.resolve);
	}

	updateScroll() {
		if (this.player) {
			const position = this.player.get(Position);

			this.scrollX = Math.floor(position.x - mapDisplayWidth / 2);
			this.scrollY = Math.floor(position.y - mapDisplayHeight / 2);

			this.refresh();
		}
	}

	private render(context: Terminal) {
		const {
			console,
			fovAlgorithm,
			fovLightWalls,
			fovMap,
			fovRadius,
			fovRecompute,
			player,
			scrollX,
			scrollY,
		} = this;

		if (fovRecompute) {
			const position = player.get(Position);

			if (position)
				recomputeFov(
					fovMap,
					position.x,
					position.y,
					fovRadius,
					fovLightWalls,
					fovAlgorithm
				);
		}

		renderAll(this);
		this.fovRecompute = false;

		this.showFps();
		context.present(console);

		clearAll(console, scrollX, scrollY);
	}

	private resolve(result: Result) {
		result.perform(this).forEach(this.resolve);
	}

	private enemyActions() {
		if (this.gameState == GameState.EnemyTurn) {
			hasAI.get().forEach(en => {
				AIRoutines[en.get(AI).routine].think(en, this).map(this.resolve);
			});

			this.gameStateStack.swap(
				isAlive(this.player) ? GameState.PlayerTurn : GameState.PlayerDead
			);
		}
	}

	private showFps() {
		const time = new Date().getTime();
		this.frames++;

		if (time - this.lastReportTime > 1000) {
			this.fpsString = `${this.frames} fps`;

			this.lastReportTime = time;
			this.frames = 0;
		}

		this.console.printBox(
			0,
			this.height - 1,
			10,
			1,
			this.fpsString,
			Colours.white,
			Colours.black
		);
	}

	addPrefabs(r: EntityDataTable) {
		Object.entries(r).forEach(([name, y]) => {
			const prefabs = y.prefabs ? y.prefabs : [];
			const obj = ecs.prefab(
				name,
				...prefabs.map(prefab => ecs.getPrefab(prefab))
			);

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
		});
	}
}
