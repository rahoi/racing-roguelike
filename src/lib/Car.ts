import Player from "./Player"
import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"

/**
 * Stores the character specific data for Car subclass
 * Extends the Player class
 */
export default class Car extends Player {
    /**
     * Initializes the character specific attributes for Car subclass
     * @param map GenerateMap object containing the generated tilemap
     * @param mapConfigData ConfigData object containing Phaser config data
     */
    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        super(map, mapConfigData);
        
        /* set player attributes */
        this.wheelBase = 131            // distance between front and rear wheels
        this.steerFactor = 30           // amount that front wheel turns
        this.enginePower = 0.0012       // forward acceleration force
        this.brakingFactor = -0.00045   // backwards acceleration force
        this.maxReverseSpeed = 1        // max reverse velocity

        /* set environment attributes: at speed 0.5 px/ms, drag force overcomes friction force
         * see https://www.desmos.com/calculator/e4ayu3xkip */
        this.friction = -0.0005
        this.drag = -0.001
        this.slipSpeed = 0.5
        this.tractionFast = 0.11
        this.tractionSlow = 0.7
        this.offRoadFactor = 10
    }
}
