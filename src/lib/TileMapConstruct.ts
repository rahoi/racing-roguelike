import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

export default class TileMapConstruct {
    scene: Phaser.Scene;
    track: object;
    mapArray: number[][];
    tileMap: Phaser.Tilemaps.Tilemap;
    tileset:Phaser.Tilemaps.Tileset;

    constructor(scene:Phaser.Scene, map: GenerateMap, mapConfigData: ConfigData) {
        this.mapArray = map.mapArray;


        this.scene = scene;
        // scene.mapArray = mapArray

        const mapConfig = {
            // data: scene.mapArray, 
            data: this.mapArray,
            tileWidth: mapConfigData.tileDimension, 
            tileHeight: mapConfigData.tileDimension 
        }

        this.tileMap = scene.make.tilemap(mapConfig);
        // this.tileset = this.tileMap.addTilesetImage(mapConfigData.tileKey);
        // this.tileMap.createLayer(0, this.tileset, 0, 0); 
    }

}
