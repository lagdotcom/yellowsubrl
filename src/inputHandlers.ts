import { SysKeyEvent } from './tcod';

export function handleKeys(key?: SysKeyEvent) {
	if (!key) return {};

	if (key.key == 'ArrowUp') return { move: [0, -1] };
	else if (key.key == 'ArrowDown') return { move: [0, 1] };
	else if (key.key == 'ArrowLeft') return { move: [-1, 0] };
	else if (key.key == 'ArrowRight') return { move: [1, 0] };

	if (key.key == 'Enter' && key.lalt) return { fullscreen: true };
	else if (key.key == 'Escape') return { exit: true };

	if (key.type === 'KeyRelease' && key.key == 'r') return { remake: true };

	return {};
}
