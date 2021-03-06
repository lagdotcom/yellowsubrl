import { toRGB } from './Colours';
import { FovAlgorithm } from './lib/TileMap';

export const width = 90;
export const height = 36;

export const barWidth = 20;
export const panelHeight = 7;

export const mapDisplayWidth = width / 2;
export const mapDisplayHeight = height - panelHeight;

export const messageX = barWidth + 2;
export const messageWidth = width - barWidth - 2;
export const messageHeight = panelHeight - 1;

export const mapWidth = width;
export const mapHeight = height - panelHeight;

export const fovAlgorithm = FovAlgorithm.RedBlob;
export const fovLightWalls = true;
export const fovRadius = 10;

export const colours: { [key: string]: string } = {
	darkWall: toRGB(0, 0, 100),
	darkGround: toRGB(50, 50, 150),
	lightWall: toRGB(130, 110, 50),
	lightGround: toRGB(200, 180, 50),
};
