import Entity from './Entity';
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
import RNG from './RNG';
import { renderAll, clearAll, ColourMap, RenderOrder } from './renderFunctions';
import Appearance from './components/Appearance';
import Location from './components/Location';
import Fighter from './components/Fighter';
import { Action } from './Action';
import Result from './results/Result';
import MessageLog from './MessageLog';
import { handleKeys, handleMouse } from './inputHandlers';
import Inventory from './components/Inventory';
import Stack from './Stack';
import Item, { HasItem } from './components/Item';

export default class Engine {
	public barWidth: number;
	public colours: ColourMap;
	public console: Console;
	public context: Terminal;
	public entities: Entity[];
	public fovAlgorithm: FovAlgorithm;
	public fovLightWalls: boolean;
	public fovMap: Map;
	public fovRadius: number;
	public fovRecompute: boolean;
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
	public player: Entity;
	public rng: RNG;
	public targetingItem?: HasItem;
	public tilesets: Tileset[];
	public width: number;

	private fpsString: string;
	private frames: number;
	private lastReportTime: number;

	constructor({
		barWidth,
		colours,
		fovAlgorithm,
		fovLightWalls,
		fovRadius,
		mapGenerator,
		mapHeight,
		mapWidth,
		messageX,
		messageHeight,
		messageWidth,
		panelHeight,
		rng,
		tilesets,
		width,
		height,
	}: {
		barWidth: number;
		colours: ColourMap;
		fovAlgorithm: FovAlgorithm;
		fovLightWalls: boolean;
		fovRadius: number;
		height: number;
		mapGenerator: MapGenerator;
		mapHeight: number;
		mapWidth: number;
		messageX: number;
		messageHeight: number;
		messageWidth: number;
		panelHeight: number;
		rng: RNG;
		tilesets: Tileset[];
		width: number;
	}) {
		(window as any).G = this;

		this.colours = colours;
		this.rng = rng;
		this.tilesets = tilesets;

		this.player = new Entity({
			name: 'Player',
			appearance: new Appearance('@', Colours.white, RenderOrder.Actor),
			fighter: new Fighter(30, 2, 5),
			inventory: new Inventory(26),
			location: new Location(0, 0, true),
		});
		this.entities = [this.player];

		this.mapGenerator = mapGenerator;
		this.mapHeight = mapHeight;
		this.mapWidth = mapWidth;
		this.gameMap = new GameMap(rng.seed, mapWidth, mapHeight);
		mapGenerator.generate(rng, this.gameMap, this.player, this.entities);

		const tileset = tilesets[0];
		this.context = new Terminal(
			width * tileset.tileWidth,
			height * tileset.tileHeight,
			tileset
		);
		this.context.listen('keydown', 'mousemove', 'mousedown');
		this.mouseX = 0;
		this.mouseY = 0;

		this.height = height;
		this.width = width;
		this.console = new Console(width, height, tileset);

		this.barWidth = barWidth;
		this.panelHeight = panelHeight;
		this.panelY = height - panelHeight;
		this.panel = new Console(width, panelHeight, tileset);

		this.messageLog = new MessageLog(messageX, messageWidth, messageHeight);

		this.fpsString = '';
		this.frames = 0;
		this.gameStateStack = new Stack(GameState.PlayerTurn);
		this.lastReportTime = new Date().getTime();

		this.fovAlgorithm = fovAlgorithm;
		this.fovLightWalls = fovLightWalls;
		this.fovRadius = fovRadius;
		this.fovMap = initializeFov(this.gameMap);
		this.fovRecompute = true;

		this.resolve = this.resolve.bind(this);
	}

	get gameState() {
		return this.gameStateStack.top;
	}

	refresh() {
		this.fovRecompute = true;
		this.console.clear();
	}

	changeFont() {
		const i = this.tilesets.indexOf(this.context.tileset);
		const j = (i + 1) % this.tilesets.length;
		const tileset = this.tilesets[j];

		this.context.setTileset(tileset);
		this.console.setTileset(tileset);
		this.panel.setTileset(tileset);
		this.fovRecompute = true;
	}

	newMap() {
		const { entities, gameMap, mapGenerator, console, rng, player } = this;

		entities.splice(0, entities.length, player);

		gameMap.reset(rng.seed, gameMap.width, gameMap.height);
		mapGenerator.generate(rng, gameMap, player, entities);

		this.player.fighter!.hp = this.player.fighter!.maxHp;
		this.player.appearance!.ch = '@';
		this.player.appearance!.colour = Colours.white;

		this.fovMap = initializeFov(gameMap);
		this.fovRecompute = true;
		console.clear();
	}

	start() {
		this.context.main(() => {
			const { key, mouse } = this.context.checkForEvents();
			this.update(key, mouse);
			this.render(this.context);
			this.enemyActions();
		});
	}

	update(key?: TerminalKey, mouse?: TerminalMouse) {
		if (mouse) [this.mouseX, this.mouseY] = [mouse.x, mouse.y];

		const kaction = handleKeys(this.gameState, key);
		if (kaction) kaction.perform(this, this.player).forEach(this.resolve);

		const maction = handleMouse(this.gameState, mouse);
		if (maction) maction.perform(this, this.player).forEach(this.resolve);
	}

	render(context: Terminal) {
		const {
			barWidth,
			colours,
			console,
			entities,
			fovAlgorithm,
			fovLightWalls,
			fovMap,
			fovRadius,
			fovRecompute,
			gameMap,
			gameState,
			height,
			messageLog,
			mouseX,
			mouseY,
			panel,
			panelHeight,
			panelY,
			player,
			width,
		} = this;

		if (fovRecompute)
			recomputeFov(
				fovMap,
				player.location!.x,
				player.location!.y,
				fovRadius,
				fovLightWalls,
				fovAlgorithm
			);

		renderAll({
			barWidth,
			colours,
			console,
			entities,
			fovMap,
			fovRecompute,
			gameMap,
			gameState,
			messageLog,
			mouseX,
			mouseY,
			panel,
			panelHeight,
			panelY,
			player,
			screenHeight: height,
			screenWidth: width,
		});
		this.fovRecompute = false;

		this.showFps();
		context.present(console);

		clearAll(console, entities);
	}

	act(action: Action) {
		const results = action.perform(this, this.player);
		results.forEach(this.resolve);
	}

	resolve(result: Result) {
		result.perform(this).forEach(this.resolve);
	}

	enemyActions() {
		if (this.gameState == GameState.EnemyTurn) {
			this.entities.forEach(en => {
				if (en.ai) en.ai.takeTurn(en, this.player, this).map(this.resolve);
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
