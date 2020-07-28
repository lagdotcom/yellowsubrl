import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';

export default class ShowCharacterAction implements Action {
	name: string;
	constructor() {
		this.name = 'showcharacter';
	}

	perform(engine: Engine) {
		engine.gameStateStack.push(GameState.CharacterScreen);
		return [];
	}
}
