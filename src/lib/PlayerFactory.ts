import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"
import type Player from "./Player";

import Car from "./Car";
import Bike from "./Bike";
import Truck from "./Truck";

/**
 * PlayerFactory generates a Player factory that creates a new Player typed object from
 * its createPlayer() method.
 */
export default class PlayerFactory {
    // map variables
    map: GenerateMap
    mapConfigData: ConfigData

    /**
     * Takes as arugments the data necessary for Player object creation
     * @param map GenerateMap object containing the generated tilemap
     * @param mapConfigData ConfigData object containing Phaser config data
     */
    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        this.map = map;
        this.mapConfigData = mapConfigData;
    }

    /**
     * Creates a new Player typed object -- Car, Bike, or Truck
     * @param type Player type
     * @returns new Player typed object
     */
    createPlayer(type: string): Player {
        switch (type) {
            case 'car': {
                return new Car(this.map, this.mapConfigData);
            }
            case 'bike': {
                return new Bike(this.map, this.mapConfigData);
            }
            case 'truck': {
                return new Truck(this.map, this.mapConfigData);
            }
        }
    }
}
