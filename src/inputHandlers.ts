import { SysKeyEvent } from './tcod';
import MovementAction from './actions/MovementAction';
import RemakeAction from './actions/RemakeAction';
import ChangeFontAction from './actions/ChangeFontAction';
import ExploreMapAction from './actions/ExploreMapAction';

export function handleKeys(e?: SysKeyEvent) {
	if (!e) return;
	const { key } = e;

	if (key == 'ArrowUp' || key == '8') return new MovementAction(0, -1);
	else if (key == 'ArrowDown' || key == '2') return new MovementAction(0, 1);
	else if (key == 'ArrowLeft' || key == '4') return new MovementAction(-1, 0);
	else if (key == 'ArrowRight' || key == '6') return new MovementAction(1, 0);
	else if (key == '7' || key == 'Home') return new MovementAction(-1, -1);
	else if (key == '9' || key == 'PageUp') return new MovementAction(1, -1);
	else if (key == '1' || key == 'End') return new MovementAction(-1, 1);
	else if (key == '3' || key == 'PageDown') return new MovementAction(1, 1);

	if (key == 'R') return new RemakeAction();
	else if (key == 'F') return new ChangeFontAction();
	else if (key == 'X') return new ExploreMapAction();

	return;
}
