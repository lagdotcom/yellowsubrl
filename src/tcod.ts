export * from './libtcod/AStar';
export * from './libtcod/Console';
export * from './libtcod/Map';
export * from './libtcod/Terminal';
export * from './libtcod/Tileset';

export function toRGB(r: number, g: number, b: number) {
	return `rgb(${r},${g},${b})`;
}

export const Colours = {
	black: toRGB(0, 0, 0),
	brown: toRGB(200, 150, 50),
	darkGreen: toRGB(0, 128, 0),
	darkRed: toRGB(128, 0, 0),
	green: toRGB(0, 255, 0),
	lightGrey: toRGB(192, 192, 192),
	lightRed: toRGB(255, 128, 128),
	orange: toRGB(255, 128, 0),
	red: toRGB(255, 0, 0),
	silver: toRGB(200, 200, 255),
	white: toRGB(255, 255, 255),
	yellow: toRGB(255, 255, 0),
};
