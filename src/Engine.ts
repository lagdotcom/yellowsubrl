import GameMap, { MapGenerator } from './GameMap';
import {
	Colours,
	Console,
	FovAlgorithm,
	Map,
	Terminal,
	Tileset,
	TerminalKey,
	TerminalMouse,
} from './tcod';
import GameState from './GameState';
import { initializeFov, recomputeFov } from './fovFunctions';
import RNG, { toReadable, fromReadable } from './RNG';
import {
	renderAll,
	clearAll,
	ColourMap,
	RenderOrder,
	drawMessageLog,
} from './renderFunctions';
import Result from './results/Result';
import MessageLog from './MessageLog';
import { handleKeys, handleMouse } from './inputHandlers';
import Stack from './Stack';
import ecs, {
	AI,
	Appearance,
	Blocks,
	Entity,
	Fighter,
	hasAI,
	Inventory,
	Player,
	Position,
} from './ecs';
import BSPTree from './generator/BSPTree';
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
	maxItemsPerRoom,
	maxMonstersPerRoom,
	messageHeight,
	messageWidth,
	messageX,
	panelHeight,
	rng,
	width,
} from './constants';
import { AIRoutines } from './components/AI';
import MessageResult from './results/MessageResult';
import { mainMenu } from './menus';

interface SaveData {
	entities: { [id: string]: any };
	map: string;
	seed: string;
}

export default class Engine {
	public barWidth: number;
	public colours: ColourMap;
	public console: Console;
	public context: Terminal;
	public fovAlgorithm: FovAlgorithm;
	public fovLightWalls: boolean;
	public fovMap: Map;
	public fovRadius: number;
	public fovRecompute!: boolean;
	public gameMap: GameMap;
	public gameStateStack: Stack<GameState>;
	public height: number;
	public mapGenerator: MapGenerator;
	public mapHeight: number;
	public mapWidth: number;
	public messageLog: MessageLog;
	public mouseX: number;
	public mouseY: number;
	public panel: Console;
	public panelHeight: number;
	public panelY: number;
	public player!: Entity;
	public rng: RNG;
	public scrollX: number;
	public scrollY: number;
	public targetingItem?: Entity;
	public tilesets: Tileset[];
	public width: number;

	private fpsString: string;
	private frames: number;
	private lastReportTime: number;

	constructor(tilesets: Tileset[]) {
		(window as any).G = this;

		this.colours = colours;
		this.rng = rng;
		this.tilesets = tilesets;

		// this.mapGenerator = new BoxesAndCorridors({
		// 	maxRooms,
		// 	roomMinSize,
		// 	roomMaxSize,
		// 	mapWidth,
		// 	mapHeight,
		// 	maxMonstersPerRoom,
		// });
		this.mapGenerator = new BSPTree(
			5,
			10,
			20,
			75,
			maxMonstersPerRoom,
			maxItemsPerRoom
		);

		this.mapHeight = mapHeight;
		this.mapWidth = mapWidth;
		this.gameMap = new GameMap(rng.seed, mapWidth, mapHeight);

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
		this.console = new Console(width, height, tileset);
		this.scrollX = 0;
		this.scrollY = 0;

		this.barWidth = barWidth;
		this.panelHeight = panelHeight;
		this.panelY = height - panelHeight;
		this.panel = new Console(width, panelHeight, tileset);

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
	}

	get gameState() {
		return this.gameStateStack.top;
	}

	newGame() {
		this.gameStateStack.swap(GameState.PlayerTurn);
		this.newMap();
	}

	saveGame() {
		// TODO: map reveal not saved

		const data: SaveData = {
			entities: {},
			seed: toReadable(this.rng.seed),
			map: toReadable(this.gameMap.seed),
		};
		ecs.find().forEach(en => {
			data.entities[en.id] = en.data();
		});

		localStorage.setItem('ysrl.save', JSON.stringify(data));
	}

	loadGame() {
		const raw = localStorage.getItem('ysrl.save');
		if (!raw) return this.messageLog.add(new MessageResult('No game to load!'));
		const data = JSON.parse(raw) as SaveData;

		this.gameMap.reset(
			fromReadable(data.map),
			this.gameMap.width,
			this.gameMap.height
		);
		this.rng.seed = this.gameMap.seed;
		this.mapGenerator.generate(this.rng, this.gameMap);
		ecs.clear();

		for (const id in data.entities) {
			const en = new Entity(ecs, id);
			const edata = data.entities[id];
			ecs.attach(en);

			for (const name in edata) {
				const co = ecs.lookup(name);
				const cdata = edata[name];
				if (!co) {
					console.log(`Unknown component: ${name}`);
					continue;
				}

				en.add(co, cdata);
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
		const { gameMap, mapGenerator, rng } = this;

		ecs.clear();

		gameMap.reset(rng.seed, gameMap.width, gameMap.height);
		const position = mapGenerator.generate(rng, gameMap);

		this.player = ecs
			.entity()
			.add(Player, {})
			.add(Appearance, {
				name: 'you',
				tile: 'Player',
				tile2: 'Player2',
				colour: Colours.white,
				order: RenderOrder.Actor,
			})
			.add(Fighter, { hp: 30, maxHp: 30, defense: 2, power: 5 })
			.add(Inventory, { capacity: 26, items: [] })
			.add(Position, position)
			.add(Blocks, {});

		this.fovMap = initializeFov(gameMap);
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
				AIRoutines[en.get(AI).routine](en, this.player, this).map(this.resolve);
			});

			this.gameStateStack.swap(GameState.PlayerTurn);
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
}
