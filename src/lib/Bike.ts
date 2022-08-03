// import types
import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"

// import classes
import Player from "./Player"

export default class Bike extends Player {

    constructor(map: MapArray, mapConfigData: ConfigData) {
        super(map, mapConfigData);
    }

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean) {
        super.updateLoc(gas, brake, left, right)
    }

    // getLocX(): number {
    //     super();
    // }
}
