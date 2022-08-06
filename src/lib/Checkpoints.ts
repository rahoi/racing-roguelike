import type GenerateMap from "./GenerateMap"
import type ConfigData from "./ConfigData"
import type Bike from "./Bike";
import type Car from "./Car";
import terrainArray from "./TerrainArray"

export default class Checkpoints {
    mapGeneration:GenerateMap;
    innerTrackPts:number[][];
    finishPt:number[];
    mapArray:number[][];

    mapConfigData:ConfigData;
    tileDimension:number;

    image:string;
    finishFlagImage:string;

    numCheckpoints:number;  // includes start/finish line
    numLaps:number;

    checkpointsArray:number[][];
    currCheckpointIndex:number;
    currLap:number;

    checkpointsCollected:number;
    totalCheckpoints:number;

    constructor(mapGeneration:GenerateMap, mapConfigData:ConfigData) {
        this.mapGeneration = mapGeneration;
        this.innerTrackPts = mapGeneration.innerTrack;
        this.finishPt = mapGeneration.innerStartLinePt;
        this.mapArray = mapGeneration.mapArray;

        this.mapConfigData = mapConfigData;
        this.tileDimension = this.mapConfigData.tileDimension;

        this.image = 'assets/Checkpoints/explosion2.png';
        this.finishFlagImage = 'assets/Checkpoints/flagBlue.png';

        this.numCheckpoints = 2;
        this.numLaps = 2;

        this.checkpointsArray = [];
        this.currCheckpointIndex = 0;

        this.checkpointsCollected = 0;
        this.totalCheckpoints = this.numCheckpoints * this.numLaps;

        this.currLap = 1;

        this.#generateCheckpoints();
    }

    // generates array of checkpoint locatitons on the tile map
    #generateCheckpoints() {
        let checkpointOffset = Math.trunc((this.innerTrackPts.length - 2) / this.numCheckpoints);

        // add checkpoints equally spaced aloong inner track points
        for (let i = 1; i < this.numCheckpoints; i++) {
            this.checkpointsArray.push(this.innerTrackPts[checkpointOffset * i]);
        }

        // add finish line to end of checkpoints
        this.checkpointsArray.push(this.finishPt);

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

    // updates checkpoint to next in array if player reaches the checkpoint
    // returns true checkpoint is updated
    updateCheckpoint(player: Car | Bike) {
        let collision:boolean = this.#checkPlayerCollision(player);

        if (collision == true) {
            this.currCheckpointIndex++;
            this.checkpointsCollected++;
            console.log("next checkpoint", this.getCheckpointCoordinate())

            // if collected all checkpoints on one lap, reset index to 0 and increase current lap
            if (this.currCheckpointIndex == this.numCheckpoints) {
                this.currCheckpointIndex = 0;
                this.currLap++;

                // returns false if user has collexted all checkpoints
                if (this.currLap > this.numLaps) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    // returns true if there's only one more checkpoint left to complete the track
    onLastCheckpoint() {
        return (this.checkpointsCollected == this.totalCheckpoints - 1);
    }

    // returns the checkpoint coordinate on the tile map
    getCheckpointCoordinate() {
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

    // checks if all checkpoints has been collected
    collectedAllCheckpoints() {
        if (this.checkpointsCollected == this.totalCheckpoints) {
            return true;
        }
        return false;
    }

    // returns true if the player has just completed a lap and has not completed all laps
    changeLap() {
        return (this.currCheckpointIndex == 0 && this.currLap != 1 && !(this.currLap > this.numLaps));
    }

    getCheckpointsCollected() {
        return this.checkpointsCollected;
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