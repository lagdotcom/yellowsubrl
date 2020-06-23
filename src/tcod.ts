import { Sys } from './libtcod/Sys';
export * from './libtcod/Console';
export * from './libtcod/Map';
export * from './libtcod/Terminal';
export * from './libtcod/Tileset';
export * from './libtcod/Sys';

export function toRGB(r: number, g: number, b: number) {
	return `rgb(${r},${g},${b})`;
}

export const Colours = {
	black: toRGB(0, 0, 0),
	white: toRGB(255, 255, 255),
	red: toRGB(255, 0, 0),
	yellow: toRGB(255, 255, 0),
};

export const sys = new Sys();
