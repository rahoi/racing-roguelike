/**
 * ConfigData stores basic information regarding the Phaser game's dimensions and background
 */
export default class ConfigData {
    backgroundColor: string;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tilesetImageSheet: string;
    tileKey: string

    /**
     * 
     * @param backgroundColor the background color of the Phaser game
     * @param tileDimension the dimensions of each tile in the spritesheet containing the Tilemap's road tiles
     * @param mapHeight height of the Phaser game in tiles
     * @param mapWidth width of the Phaser game in tiles
     * @param tilesetImageSheet the location of the Tilemap spritesheet
     * @param tileKey name given to the Tilemap spritesheet
     */
    constructor(backgroundColor: string, tileDimension: number, mapHeight: number, mapWidth: number, tilesetImageSheet: string, tileKey: string) {
        this.backgroundColor = backgroundColor;
        this.tileDimension = tileDimension;
        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;
        this.tilesetImageSheet = tilesetImageSheet;
        this.tileKey = tileKey;
    }
}
