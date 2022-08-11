// import types
import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

// import classes
import Player from "./Player"

export default class Bike extends Player {

    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        super(map, mapConfigData);

        // set player attributes
        this.wheelBase = 100            // distance between front and rear wheels
        this.steerFactor = 25           // amount that front wheel turns
        this.enginePower = 0.0015        // forward acceleration force
        this.brakingFactor = -0.00085   // backwards acceleration force
        this.maxReverseSpeed = 1.1        // max reverse velocity

        /* set environment attributes: at speed 0.625 px/ms, drag force overcomes friction force
         * see https://www.desmos.com/calculator/e4ayu3xkip */
        this.friction = -0.0005
        this.drag = -0.0008
        this.slipSpeed = 0.5
        this.tractionFast = 0.09
        this.tractionSlow = 0.8
        this.offRoadFactor = 8
    }
}
