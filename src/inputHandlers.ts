import { TerminalKey } from './tcod';
import { TerminalMouse } from './libtcod/Terminal';
import CancelTargetingAction from './actions/CancelTargetingAction';
import ChangeFontAction from './actions/ChangeFontAction';
import ChooseScenarioAction from './actions/ChooseScenarioAction';
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
import ScrollAction from './actions/ScrollAction';
import ShowInventoryAction from './actions/ShowInventoryAction';
import UseInventoryAction from './actions/UseInventoryAction';
import TakeStairsAction from './actions/TakeStairsAction';
import LevelUpAction, { LevelUpResponse } from './actions/LevelUpAction';
import ShowCharacterAction from './actions/ShowCharacterAction';
import WaitAction from './actions/WaitAction';
import scenarios from './scenarios';

export function handleKeys(gameState: GameState, e?: TerminalKey) {
	if (!e) return;

	switch (gameState) {
		case GameState.MainMenu:
			return handleMainMenuKeys(e);

		case GameState.ChoosingSetup:
			return handleSetupMenuKeys(e);

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

		case GameState.LevelUp:
			return handleLevelUpKeys(e);

		case GameState.CharacterScreen:
			return handleCharacterKeys(e);
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

	if (key == 'n') return new ChooseScenarioAction();
	else if (key == 'l') return new LoadGameAction();

	if (key == 'F') return new ChangeFontAction();
}

export function handleSetupMenuKeys(e: TerminalKey) {
	const { key } = e;

	if (key in scenarios) {
		return new NewGameAction(scenarios[key]);
	}
}

function dirAction(ctrl: boolean, dx: number, dy: number) {
	return ctrl ? new ScrollAction(dx, dy) : new MovementAction(dx, dy);
}

export function handlePlayerTurnKeys(e: TerminalKey) {
	const { key, ctrl } = e;

	if (key == 'ArrowUp' || key == '8') return dirAction(ctrl, 0, -1);
	else if (key == 'ArrowDown' || key == '2') return dirAction(ctrl, 0, 1);
	else if (key == 'ArrowLeft' || key == '4') return dirAction(ctrl, -1, 0);
	else if (key == 'ArrowRight' || key == '6') return dirAction(ctrl, 1, 0);
	else if (key == '7' || key == 'Home') return dirAction(ctrl, -1, -1);
	else if (key == '9' || key == 'PageUp') return dirAction(ctrl, 1, -1);
	else if (key == '1' || key == 'End') return dirAction(ctrl, -1, 1);
	else if (key == '3' || key == 'PageDown') return dirAction(ctrl, 1, 1);
	else if (key == '5' || key == 'Clear') return new WaitAction();

	if (key == 'g') return new GetAction();
	else if (key == 'i') return new ShowInventoryAction(GameState.ShowInventory);
	else if (key == 'd') return new ShowInventoryAction(GameState.DropInventory);
	else if (key == '>' || key == 'Enter') return new TakeStairsAction();
	else if (key == 'c') return new ShowCharacterAction();

	if (key == 'S') return new SaveGameAction();
	else if (key == 'R') return new RemakeAction();
	else if (key == 'F') return new ChangeFontAction();
	else if (key == 'X') return new ExploreMapAction();
}

export function handlePlayerDeadKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'i') return new ShowInventoryAction(GameState.ShowInventory);

	if (key == 'R') return new RemakeAction();
	else if (key == 'F') return new ChangeFontAction();
	else if (key == 'X') return new ExploreMapAction();
}

const asciiForA = 'a'.charCodeAt(0);
export function handleShowInventoryKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'Escape') return new ExitAction();

	return new UseInventoryAction(key);
}

export function handleDropInventoryKeys(e: TerminalKey) {
	const { key } = e;

	if (key == 'Escape') return new ExitAction();

	return new DropInventoryAction(key);
}

export function handleTargetingKeys(e: TerminalKey) {
	if (e.key == 'Escape') return new CancelTargetingAction();
}

export function handleTargetingMouse(m: TerminalMouse) {
	if (m.button == 0) return new ChooseTargetAction(m.x, m.y);
	if (m.button == 2) return new CancelTargetingAction();
}

export function handleLevelUpKeys(e: TerminalKey) {
	if (e.key == 'a') return new LevelUpAction(LevelUpResponse.Agility);
	if (e.key == 'c') return new LevelUpAction(LevelUpResponse.HP);
	if (e.key == 's') return new LevelUpAction(LevelUpResponse.Strength);
}

export function handleCharacterKeys(e: TerminalKey) {
	if (e.key == 'Escape') return new ExitAction();
}
