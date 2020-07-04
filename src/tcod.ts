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
	blue: toRGB(0, 0, 255),
	brown: toRGB(165, 42, 42),
	cyan: toRGB(0, 255, 255),
	darkGreen: toRGB(0, 100, 0),
	darkRed: toRGB(139, 0, 0),
	green: toRGB(0, 128, 0),
	lightCyan: toRGB(128, 255, 255),
	lightGreen: toRGB(128, 255, 128),
	lightGrey: toRGB(211, 211, 211),
	lightPink: toRGB(250, 175, 186),
	lightRed: toRGB(255, 128, 128),
	lightYellow: toRGB(255, 255, 128),
	orange: toRGB(255, 165, 0),
	red: toRGB(255, 0, 0),
	silver: toRGB(192, 192, 192),
	white: toRGB(255, 255, 255),
	violet: toRGB(238, 130, 238),
	yellow: toRGB(255, 255, 0),
};
