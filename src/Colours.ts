export function toRGB(r: number, g: number, b: number) {
	return `rgb(${r},${g},${b})`;
}

const Colours = {
	default: 'default',
	black: toRGB(0, 0, 0),
	blue: toRGB(0, 0, 255),
	brown: toRGB(165, 42, 42),
	cyan: toRGB(0, 255, 255),
	darkGreen: toRGB(0, 100, 0),
	darkGrey: toRGB(169, 169, 169),
	darkOrange: toRGB(255, 140, 0),
	darkRed: toRGB(139, 0, 0),
	green: toRGB(0, 128, 0),
	grey: toRGB(128, 128, 128), // don't ask me why grey is darker than darkgrey in html
	lightCyan: toRGB(128, 255, 255),
	lightGreen: toRGB(128, 255, 128),
	lightGrey: toRGB(211, 211, 211),
	lightPink: toRGB(250, 175, 186),
	lightRed: toRGB(255, 128, 128),
	lightViolet: toRGB(255, 180, 255),
	lightYellow: toRGB(255, 255, 128),
	orange: toRGB(255, 165, 0),
	red: toRGB(255, 0, 0),
	silver: toRGB(192, 192, 192),
	sky: toRGB(135, 206, 235),
	white: toRGB(255, 255, 255),
	violet: toRGB(238, 130, 238),
	yellow: toRGB(255, 255, 0),
};
export default Colours;
