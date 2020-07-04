import { TerminalKey } from './tcod';
import { TerminalMouse } from './libtcod/Terminal';
import CancelTargetingAction from './actions/CancelTargetingAction';
import ChangeFontAction from './actions/ChangeFontAction';
import ChooseTargetAction from './actions/ChooseTargetAction';
import DropInventoryAction from './actions/DropInventoryAction';
import ExitAction from './actions/ExitAction';
import ExploreMapAction from './actions/ExploreMapAction';
import GameState from './GameState';
import GetAction from './actions/GetAction';
import LoadGameAction from './actions/LoadGameAction';
import MovementAction from './actions/MovementAction';
import NewGameAction from './actions/NewGameAction';
import RemakeAction from './actions/RemakeAction';
import SaveGameAction from './actions/SaveGameAction';
import ShowInventoryAction from './actions/ShowInventoryAction';
import UseInventoryAction from './actions/UseInventoryAction';

export function handleKeys(gameState: GameState, e?: TerminalKey) {
	if (!e) return;

	switch (gameState) {
		case GameState.MainMenu:
			return handleMainMenuKeys(e);

		case GameState.PlayerTurn:
			return handlePlayerTurnKeys(e);

		case GameState.PlayerDead:
			return handlePlayerDeadKeys(e);

		case GameState.ShowInventory:
			return handleShowInventoryKeys(e);

		case GameState.DropInventory:
			return handleDropInventoryKeys(e);

		case GameState.Targeting:
			return handleTargetingKeys(e);
	}
}

export function handleMouse(gameState: GameState, m?: TerminalMouse) {
	if (!m || m.type != 'mousedown') return;

	switch (gameState) {
		case GameState.Targeting:
			return handleTargetingMouse(m);
	}
}

export function handleMainMenuKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'a') return new NewGameAction();
	else if (key == 'b') return new LoadGameAction();
}

export function handlePlayerTurnKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'ArrowUp' || key == '8') return new MovementAction(0, -1);
	else if (key == 'ArrowDown' || key == '2') return new MovementAction(0, 1);
	else if (key == 'ArrowLeft' || key == '4') return new MovementAction(-1, 0);
	else if (key == 'ArrowRight' || key == '6') return new MovementAction(1, 0);
	else if (key == '7' || key == 'Home') return new MovementAction(-1, -1);
	else if (key == '9' || key == 'PageUp') return new MovementAction(1, -1);
	else if (key == '1' || key == 'End') return new MovementAction(-1, 1);
	else if (key == '3' || key == 'PageDown') return new MovementAction(1, 1);

	if (key == 'g') return new GetAction();
	else if (key == 'i') return new ShowInventoryAction(GameState.ShowInventory);
	else if (key == 'd') return new ShowInventoryAction(GameState.DropInventory);

	if (key == 'S') return new SaveGameAction();
	else if (key == 'R') return new RemakeAction();
	else if (key == 'F') return new ChangeFontAction();
	else if (key == 'X') return new ExploreMapAction();
}

export function handlePlayerDeadKeys(e: TerminalKey) {
	const { key } = e;

	// TODO: this is kinda wrong; would let you use potions while dead
	if (key == 'i') return new ShowInventoryAction(GameState.ShowInventory);

	if (key == 'R') return new RemakeAction();
	else if (key == 'F') return new ChangeFontAction();
	else if (key == 'X') return new ExploreMapAction();
}

const asciiForA = 'a'.charCodeAt(0);
export function handleShowInventoryKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'Escape') return new ExitAction();

	const index = key.charCodeAt(0) - asciiForA;
	if (index >= 0) return new UseInventoryAction(index);
}

export function handleDropInventoryKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'Escape') return new ExitAction();

	const index = key.charCodeAt(0) - asciiForA;
	if (index >= 0) return new DropInventoryAction(index);
}

export function handleTargetingKeys(e: TerminalKey) {
	if (e.key == 'Escape') return new CancelTargetingAction();
}

export function handleTargetingMouse(m: TerminalMouse) {
	if (m.button == 0) return new ChooseTargetAction(m.x, m.y);
	if (m.button == 2) return new CancelTargetingAction();
}
