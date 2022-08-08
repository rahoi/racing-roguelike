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

        this.mapConfig = {
            // data: scene.mapArray, 
            data: this.mapArray,
            tileWidth: mapConfigData.tileDimension, 
            tileHeight: mapConfigData.tileDimension,
            tileKey: mapConfigData.tileKey 
        }
        this.tileMap = this.scene.make.tilemap(this.mapConfig);
        //this.tileMap
    }

    createLayerMap() {
        const tileset = this.tileMap.addTilesetImage(this.mapConfig.tileKey);
        this.mapLayer = this.tileMap.createLayer(0, tileset, 0, 0)
        // this.mapLayer = this.tileMap.createBlankLayer('mLayer', tileset, 0, 0).setDepth(1); //setVisible(false);

        //this.scene.make.image( 100, 100).setDepth(5)
        //this.mapArray

        
        // this.rt = this.scene.add.renderTexture(0, 0, 800, 600);

        // this.rt.draw(this.mapLayer, 200, 0);
        // this.rt.alpha = 0.5
        

        this.tileMap = scene.make.tilemap(mapConfig);
        // this.tileset = this.tileMap.addTilesetImage(mapConfigData.tileKey);
        // this.tileMap.createLayer(0, this.tileset, 0, 0); 
    }

}
