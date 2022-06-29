import mapData from "./MapData.js"
import mapArray from "./MapArray.js"

let tileMapConstruct = {
    initialize: function(scene) {
        this.scene = scene
        scene.mapArray = mapArray

        const mapConfig = {
            // data: scene.mapArray, 
            data: mapArray,
            tileWidth: mapData.tileDimension, 
            tileHeight: mapData.tileDimension 
        }

        const map = scene.make.tilemap(mapConfig);
        const tileset = map.addTilesetImage(mapData.tileKey);
        this.roadLayer = map.createLayer(0, tileset, 0, 0); 
    }
}

export default tileMapConstruct