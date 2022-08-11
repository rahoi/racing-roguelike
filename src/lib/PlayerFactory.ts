import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"
import type Player from "./Player";

import Car from "./Car";
import Bike from "./Bike";
import Truck from "./Truck";

export default class PlayerFactory {
    // map variables
    map: GenerateMap;
    mapConfigData: ConfigData

    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        this.map = map;
        this.mapConfigData = mapConfigData;
    }

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
