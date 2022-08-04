// import types
import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"
import type {force, dir} from "./forceDirTypes"

// import classes
import Player from "./Player"

export default class Car extends Player {

    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        super(map, mapConfigData);        
    }

    updateDir(dir: dir) {
        super.updateDir(dir)
        
    }

    updateLoc(force: force) {
        super.updateLoc(force, 0)
    }

    updateMap() {
        super.updateMap()
    }

    onTrack() {
        return super.onTrack()
    }

    carMask(scene: Phaser.Scene){
        const mask = scene.make.image({
            x: this.posX,
            y: this.posY,
            key: 'mask',
            add: true
        });
    }
}
