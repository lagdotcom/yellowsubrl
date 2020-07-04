import { toRGB, FovAlgorithm } from './tcod';
import RNG from './RNG';

export const rng = new RNG();

export const width = 60;
export const height = 40;

export const barWidth = 20;
export const panelHeight = 7;

export const messageX = barWidth + 2;
export const messageWidth = width - barWidth - 2;
export const messageHeight = panelHeight - 1;

export const mapWidth = width;
export const mapHeight = height - panelHeight;

export const roomMaxSize = 10;
export const roomMinSize = 6;
export const maxRooms = 30;

export const fovAlgorithm = FovAlgorithm.RedBlob;
export const fovLightWalls = true;
export const fovRadius = 10;

export const maxMonstersPerRoom = 3;
export const maxItemsPerRoom = 2;

export const colours: { [key: string]: string } = {
	darkWall: toRGB(0, 0, 100),
	darkGround: toRGB(50, 50, 150),
	lightWall: toRGB(130, 110, 50),
	lightGround: toRGB(200, 180, 50),
};
