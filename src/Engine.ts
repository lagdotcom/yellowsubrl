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
import { Action } from './Action';
import Result from './results/Result';
import MessageLog from './MessageLog';
import { handleKeys, handleMouse } from './inputHandlers';
import Stack from './Stack';
import ecs, {
	Query,
	Entity,
	Player,
	Appearance,
	Fighter,
	Inventory,
	Position,
	Blocks,
	hasAI,
	AI,
} from './ecs';

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
	public targetingItem?: Entity;
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

		this.mapGenerator = mapGenerator;
		this.mapHeight = mapHeight;
		this.mapWidth = mapWidth;
		this.gameMap = new GameMap(rng.seed, mapWidth, mapHeight);

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

		this.resolve = this.resolve.bind(this);

		this.newMap();
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
		const { gameMap, mapGenerator, console, rng } = this;

		ecs.clear();
		this.player = ecs
			.entity()
			.add(Player, {})
			.add(Appearance, {
				name: 'you',
				ch: '@',
				colour: Colours.white,
				order: RenderOrder.Actor,
			})
			.add(Fighter, { hp: 30, maxHp: 30, defense: 2, power: 5 })
			.add(Inventory, { capacity: 26, items: [] })
			.add(Position, { x: 0, y: 0 })
			.add(Blocks, {});

		gameMap.reset(rng.seed, gameMap.width, gameMap.height);
		mapGenerator.generate(rng, gameMap, this.player);

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

		renderAll({
			barWidth,
			colours,
			console,
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

		clearAll(console);
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
			hasAI.get().forEach(en => {
				en.get(AI).routine.perform(en, this.player, this).map(this.resolve);
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
