import Action from './Action';
import Engine from '../Engine';
import GameState from '../GameState';

export default class ShowCharacterAction implements Action {
	perform(engine: Engine) {
		engine.gameStateStack.push(GameState.CharacterScreen);
		return [];
	}
}
