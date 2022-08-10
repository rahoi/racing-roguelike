import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

/**
 * TileMapConstruct creates a Tilemap given configuration data about the game
 */
export default class TileMapConstruct {
    scene: Phaser.Scene;
    track: object;
    mapArray: number[][];
    tileMap: Phaser.Tilemaps.Tilemap;
    tileset:Phaser.Tilemaps.Tileset;


    /**
     * Creates the Tilemap for the game using data from ConfigData
     * 
     * @param scene the current Phaser scene
     * @param map the GenerateMap object containing data for the Tilemap
     * @param mapConfigData the ConfigData object containing the game's basic information (height, width, etc)
     */
    constructor(scene:Phaser.Scene, map: GenerateMap, mapConfigData: ConfigData) {
        this.mapArray = map.mapArray;
        this.scene = scene;

        const mapConfig = {
            data: this.mapArray,
            tileWidth: mapConfigData.tileDimension, 
            tileHeight: mapConfigData.tileDimension 
        }

        this.tileMap = scene.make.tilemap(mapConfig);
        // this.tileset = this.tileMap.addTilesetImage(mapConfigData.tileKey);
        // this.tileMap.createLayer(0, this.tileset, 0, 0); 
    }

}