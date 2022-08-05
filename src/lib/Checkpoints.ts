import type GenerateMap from "./GenerateMap"
import type ConfigData from "./ConfigData"
import type Bike from "./Bike";
import type Car from "./Car";
import terrainArray from "./TerrainArray"

export default class Checkpoints {
    mapGeneration:GenerateMap;
    innerTrackPts:number[][];
    mapArray:number[][];

    mapConfigData:ConfigData;
    tileDimension:number;

    image:string;

    numCheckpoints:number;
    numLaps:number;

    checkpointsArray:number[][];
    currCheckpointIndex:number;
    currLap:number;

    constructor(mapGeneration:GenerateMap, mapConfigData:ConfigData) {
        this.mapGeneration = mapGeneration;
        this.innerTrackPts = mapGeneration.innerTrack;
        this.mapArray = mapGeneration.mapArray;

        this.mapConfigData = mapConfigData;
        this.tileDimension = this.mapConfigData.tileDimension;

        this.image = 'assets/Checkpoints/explosion2.png';

        this.numCheckpoints = 2;
        this.numLaps = 2;

        this.checkpointsArray = [];
        this.currCheckpointIndex = 0;

        this.#generateCheckpoints();
    }

    // generates array of checkpoint locatitons on the tile map
    #generateCheckpoints() {
        let checkpointOffset = Math.trunc((this.innerTrackPts.length - 2) / this.numCheckpoints);

        for (let i = 1; i <= this.numCheckpoints; i++) {
            this.checkpointsArray.push(this.innerTrackPts[checkpointOffset * i]);
        }

        for (let i = 0; i < this.numCheckpoints; i++) {
            console.log(this.checkpointsArray[i]);
            console.log(this.mapArray[this.checkpointsArray[i][0]][this.checkpointsArray[i][1]]);
        }
    }

    // returns true if the player's sprite collided with the current checkpoint
    #checkPlayerCollision(player: Car | Bike) {
        let playerX = player.getLocX();
        let playerY = player.getLocY();

        let playerTileWidth:number = Math.trunc(playerX / this.tileDimension);
        let playerTileHeight:number = Math.trunc((-1) * playerY / this.tileDimension);

        if (playerTileHeight == this.checkpointsArray[this.currCheckpointIndex][0] && playerTileWidth == this.checkpointsArray[this.currCheckpointIndex][1]) {
            console.log("on checkpoint")
            return true;
        }

        return false;
    }

    // updates checkpoint to next in array and returns true if player collected the previous checkpoint
    updateCheckpoint(player: Car | Bike) {
        let collision:boolean = this.#checkPlayerCollision(player);

        if (collision == true) {
            this.currCheckpointIndex++;
            console.log("next checkpoint", this.getCheckpoint())

            // if collected all checkpoints on one lap, reset index to 0 and increase current lap
            if (this.currCheckpointIndex == this.numCheckpoints) {
                this.currCheckpointIndex = 0;
                this.currLap++;
            }
            return true;
        }

        return false;
    }

    // returns the checkpoint coordinate on the tile map
    getCheckpoint() {
        return this.checkpointsArray[this.currCheckpointIndex];
    }

    // returns checkpoint location in pixels
    getCheckpointLoc() {
        let trackTile = this.mapArray[this.checkpointsArray[this.currCheckpointIndex][0]][this.checkpointsArray[this.currCheckpointIndex][1]];

        let checkpointHeight:number = (this.checkpointsArray[this.currCheckpointIndex][0] * this.tileDimension) + this.tileDimension / 2;
        let checkpointWidth:number = (this.checkpointsArray[this.currCheckpointIndex][1] * this.tileDimension) + this.tileDimension / 2;

        console.log('pixels', checkpointHeight, checkpointWidth)

        return [checkpointHeight, checkpointWidth];  
    }

    // returns two element array of the amount to offset each checkpoint coordinate to center its image on the race track
    #getPixelImageOffset() {
        let trackTile = this.mapArray[this.checkpointsArray[this.currCheckpointIndex][0]][this.checkpointsArray[this.currCheckpointIndex][1]];

        if (terrainArray.straight_up) {

        }
    }

    getTotalNumCheckpoints() {
        return this.numLaps * this.numCheckpoints;
    }

    getTotalNumLaps() {
        return this.numLaps;
    }

    getCurrentLap() {
        return this.currLap;
    }

    // place checkpoint sprite underneath the fow layers so it isnt shown under the gray?
    // 
}