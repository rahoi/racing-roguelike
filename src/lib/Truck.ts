import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"
import Player from "./Player"

/**
 * Stores the character specific data for Truck subclass
 * Extends the Player class
 */
export default class Truck extends Player {
    /**
     * Initializes the character specific attributes Truck subclass
     * @param map GenerateMap object containing the generated tilemap
     * @param mapConfigData ConfigData object containing Phaser config data
     */
    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        super(map, mapConfigData);

        /* set player attributes */
        this.wheelBase = 131            // distance between front and rear wheels
        this.steerFactor = 28           // amount that front wheel turns
        this.enginePower = 0.0021       // forward acceleration force
        this.brakingFactor = -0.0008    // backwards acceleration force
        this.maxReverseSpeed = 1.2      // max reverse velocity

        /* set environment attributes: at speed 0.4 px/ms, drag force overcomes friction force
         * see https://www.desmos.com/calculator/e4ayu3xkip */
        this.friction = -0.0006
        this.drag = -0.0015
        this.slipSpeed = 0.4
        this.tractionFast = 0.12
        this.tractionSlow = 0.75
        this.offRoadFactor = 9
    }
}
