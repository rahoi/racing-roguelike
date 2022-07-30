// import types
import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"
import type {force, dir} from "./forceDirTypes"

// import classes
import Player from "./Player"

export default class Bike extends Player {

    constructor(map: MapArray, mapConfigData: ConfigData) {
        super(map, mapConfigData); 
    }

    updateDir(dir: dir) {
        super.updateDir(dir)

    }

    updateLoc(force: force) {
        super.updateLoc(force, 5) // exaggerated
    }

    updateMap() {
        super.updateMap()
    }

    onTrack() {
        return super.onTrack()
    }
}
