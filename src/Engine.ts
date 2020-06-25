import Entity from './Entity';
import GameMap, { MapGenerator } from './GameMap';
import { Console, Colours, Terminal, Map, Tileset, FovAlgorithm } from './tcod';
import GameState from './GameState';
import { initializeFov, recomputeFov } from './fovFunctions';
import RNG from './RNG';
import { renderAll, clearAll, ColourMap, RenderOrder } from './renderFunctions';
import Appearance from './components/Appearance';
import Location from './components/Location';
import Fighter from './components/Fighter';
import { Action } from './Action';
import Result from './results/Result';

export default class Engine {
	public console: Console;
	public entities: Entity[];
	public fovMap: Map;
	public fovRecompute: boolean;
	public gameMap: GameMap;
	public gameState: GameState;
	public player: Entity;

	private fpsString: string;
	private frames: number;
	private lastReportTime: number;

	constructor(
		public colours: ColourMap,
		public fovAlgorithm: FovAlgorithm,
		public fovLightWalls: boolean,
		public fovRadius: number,
		public mapGenerator: MapGenerator,
		public mapWidth: number,
		public mapHeight: number,
		public rng: RNG,
		public tilesets: Tileset[],
		public width: number,
		public height: number
	) {
		(window as any).G = this;

		this.player = new Entity({
			name: 'Player',
			appearance: new Appearance('@', Colours.white, RenderOrder.Actor),
			fighter: new Fighter(30, 2, 5),
			location: new Location(0, 0, true),
		});
		this.entities = [this.player];

		this.gameMap = new GameMap(rng.seed, mapWidth, mapHeight);
		mapGenerator.generate(rng, this.gameMap, this.player, this.entities);

		this.console = new Console(width, height, tilesets[0]);

		this.fpsString = '';
		this.frames = 0;
		this.gameState = GameState.PlayerTurn;
		this.lastReportTime = new Date().getTime();

		this.fovMap = initializeFov(this.gameMap);
		this.fovRecompute = true;

		this.resolve = this.resolve.bind(this);
	}

	changeFont() {
		const i = this.tilesets.indexOf(this.console.tileset);
		const j = (i + 1) % this.tilesets.length;

		this.console.setTileset(this.tilesets[j]);
		this.fovRecompute = true;
	}

	newMap() {
		const { entities, gameMap, mapGenerator, console, rng, player } = this;

		entities.splice(0, entities.length, player);

		gameMap.reset(rng.seed, gameMap.width, gameMap.height);
		mapGenerator.generate(rng, gameMap, player, entities);

		this.fovMap = initializeFov(gameMap);
		this.fovRecompute = true;
		console.clear();
	}

	render(context: Terminal) {
		const {
			colours,
			console,
			entities,
			fovAlgorithm,
			fovLightWalls,
			fovMap,
			fovRadius,
			fovRecompute,
			gameMap,
			height,
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
			console,
			entities,
			gameMap,
			fovMap,
			player,
			screenHeight: height,
			screenWidth: width,
			fovRecompute,
			colours,
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
				if (en.ai)
					en.ai
						.takeTurn(en, this.player, this.fovMap, this.gameMap, this.entities)
						.map(this.resolve);
			});

			this.gameState = GameState.PlayerTurn;
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
			0,
			10,
			1,
			this.fpsString,
			Colours.white,
			Colours.black
		);
	}
}
