import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

export default class TileMapConstruct {
    scene: Phaser.Scene;
    track: object;
    mapArray: number[][];
    tileMap: Phaser.Tilemaps.Tilemap;
    mapLayer: Phaser.Tilemaps.TilemapLayer;
    mapConfig: {
        // data: scene.mapArray, 
        data: number[][]; tileWidth: number; tileHeight: number; tileKey: string;
    };

    constructor(scene:Phaser.Scene, map: GenerateMap, mapConfigData: ConfigData) {
        this.mapArray = map.mapArray;


        this.scene = scene;
        // scene.mapArray = mapArray

        this.mapConfig = {
            // data: scene.mapArray, 
            data: this.mapArray,
            tileWidth: mapConfigData.tileDimension, 
            tileHeight: mapConfigData.tileDimension,
            tileKey: mapConfigData.tileKey 
        }
        this.tileMap = this.scene.make.tilemap(this.mapConfig);
    }

    createLayerMap() {
        const tileset = this.tileMap.addTilesetImage(this.mapConfig.tileKey);
        this.mapLayer = this.tileMap.createLayer(0, tileset, 0, 0); 
        return this.mapLayer;
    }

}
