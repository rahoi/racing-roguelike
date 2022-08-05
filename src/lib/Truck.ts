// import types
import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

// import classes
import Player from "./Player"

export default class Truck extends Player {

    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        super(map, mapConfigData);
    }

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean) {
        super.updateLoc(gas, brake, left, right)
    }
}
