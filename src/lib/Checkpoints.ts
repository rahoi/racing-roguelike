import type GenerateMap from "./GenerateMap"
import type ConfigData from "./ConfigData"
import type Bike from "./Bike";
import type Car from "./Car";
import terrainArray from "./TerrainArray"

/**
 * Checkpoints generates a series of checkpoints for the given race track, determines and updates its location, 
 * and determines collisions with the player's vehicle
 */
export default class Checkpoints {
    mapGeneration:GenerateMap;
    innerTrackPts:number[][];   // array of inner track points
    finishPt:number[];  // coordinate of the track's start/finish line
    mapArray:number[][];    // array of all tiles on the Tilemap

    mapConfigData:ConfigData;
    tileDimension:number;   // dimension of tiles on the Tilemap

    image:string;   // checkpoint image path/location
    finishFlagImage:string; // finish flag image path/location

    numCheckpoints:number;  // number of checkpoints for each lap of the track, includes start/finish line
    numLaps:number; // number of laps to complete the level

    checkpointsArray:number[][];    // array containing all checkpoint coordinates/locations on the Tilemap
    currCheckpointIndex:number; // the current checkpoint the player is attempting to collect
    currLap:number; // the current lap the player is on

    checkpointsCollected:number;    // the number of checkpoints collected by the player
    totalCheckpoints:number;    // total nunmber of checkpoints needed to complete the level

    /**
     * Stores relevant information for checkpoints in class properties and calls #generateCheckpoints() to generate an array of checkpoints
     * 
     * @param mapGeneration GenerateMap object containing data regarding the race track's coordinates on the Tilemap
     * @param mapConfigData ConfigData object containing the game's basic information (height, width, etc)
     */
    constructor(mapGeneration:GenerateMap, mapConfigData:ConfigData) {
        this.mapGeneration = mapGeneration;
        this.innerTrackPts = mapGeneration.innerTrack;
        this.finishPt = mapGeneration.innerStartLinePt;
        this.mapArray = mapGeneration.mapArray;

        this.mapConfigData = mapConfigData;
        this.tileDimension = this.mapConfigData.tileDimension;

        // path/location of the checkpoint and finish flag images
        this.image = 'assets/Checkpoints/explosion2.png';
        this.finishFlagImage = 'assets/Checkpoints/flagBlue.png';

        // desired number of checkpoints and laps to complete each level (can be adjusted)
        this.numCheckpoints = 3;
        this.numLaps = 2;

        this.checkpointsArray = [];
        this.currCheckpointIndex = 0;

        this.checkpointsCollected = 0;
        this.totalCheckpoints = this.numCheckpoints * this.numLaps;

        this.currLap = 1;

        // generates an array of checkpoints
        this.#generateCheckpoints();
    }


    /**
     * updates checkpoint to next in array if player reaches the current checkpoint
     * 
     * @param player the Player object
     * @returns true checkpoint is updated
     */
    updateCheckpoint(player: Car | Bike) {
        let collision:boolean = this.#checkPlayerCollision(player);

        if (collision == true) {
            this.currCheckpointIndex++;
            this.checkpointsCollected++;

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

    /**
     * determines if the player has one more checkpoint to finish the level
     * 
     * @returns true if there's only one more checkpoint left to complete the track
     */
    onLastCheckpoint() {
        return (this.checkpointsCollected == this.totalCheckpoints - 1);
    }

    /**
     * returns the current checkpoint's coordinates
     * 
     * @returns the current checkpoint coordinate on the tile map
     */
    getCheckpointCoordinate() {
        return this.checkpointsArray[this.currCheckpointIndex];
    }

    /**
     * returns the checkpoint's location on the map in pixels
     * 
     * @returns checkpoint location in pixels
     */
    getCheckpointLoc() {
        let trackTile = this.mapArray[this.checkpointsArray[this.currCheckpointIndex][0]][this.checkpointsArray[this.currCheckpointIndex][1]];
        let locOffset = this.#getPixelImageOffset();

        let checkpointHeight:number = (this.checkpointsArray[this.currCheckpointIndex][0] * this.tileDimension) + locOffset[0];
        let checkpointWidth:number = (this.checkpointsArray[this.currCheckpointIndex][1] * this.tileDimension) + locOffset[1];

        console.log(this.checkpointsArray[this.currCheckpointIndex])

        return [checkpointHeight, checkpointWidth];  
    }

    /**
     * determines whether the player is within the fog of war radius of the checkpoint 
     * and if the checkpoint should be seen
     * 
     * @param player the Player object
     * @param fowRadius the radius of fog of war
     * @returns true if checkpoint is within fog of war radius of the player's vehicle
     */
    isVisible(player:Car | Bike, fowRadius:number) {
        let xMin:number = Math.trunc(player.getLocX() / this.mapConfigData.tileDimension) - (fowRadius / 2);
        let xMax:number = Math.trunc(player.getLocX() / this.mapConfigData.tileDimension) + (fowRadius / 2);
        let yMin:number = -Math.trunc(player.getLocY() / this.mapConfigData.tileDimension) - (fowRadius / 2);
        let yMax:number = -Math.trunc(player.getLocY() / this.mapConfigData.tileDimension) + (fowRadius / 2);

        if ((this.getCheckpointCoordinate()[1] >= xMin) &&  (this.getCheckpointCoordinate()[1] <= xMax) 
        && (this.getCheckpointCoordinate()[0] >= yMin) && (this.getCheckpointCoordinate()[0] <= yMax)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * checks if all checkpoints has been collected
     * 
     * @returns true if number of checkpoints collected is equal to total number of checkpoints for the level
     */
    collectedAllCheckpoints() {
        if (this.checkpointsCollected == this.totalCheckpoints) {
            return true;
        }
        return false;
    }

    /**
     * determines if the player has just completed a lap, but has not completed all laps,
     * so the current lap the player is on should be updated
     * 
     * @returns true if the current lap is not greater than the total number of laps
     */
    changeLap() {
        return (this.currCheckpointIndex == 0 && this.currLap != 1 && !(this.currLap > this.numLaps));
    }

    /**
     * returns the number of checkpoints collected so far
     * 
     * @returns the number of checkpoints collected 
     */
    getCheckpointsCollected() {
        return this.checkpointsCollected;
    }

    /**
     * returns the total number of checkpoints that need to be collected to complete the level
     * 
     * @returns the number of total checkpoints for the level
     */
    getTotalNumCheckpoints() {
        return this.numLaps * this.numCheckpoints;
    }

    /**
     * returns the number of laps that need to be completed to complete the level
     * 
     * @returns the number of laps in the level
     */
    getTotalNumLaps() {
        return this.numLaps;
    }

    /**
     * returns what lap the player is currently on
     * 
     * @returns the current lap the player is on
     */
    getCurrentLap() {
        return this.currLap;
    }

    /**
     * returns an array of the checkpoints for the race track
     * 
     * @returns the array of checkpoints
     */
    getCheckpointArray() {
        return this.checkpointsArray;
    }

    // ----------------------------------Priavte helper functions----------------------------------

    /**
     * generates array of checkpoint locations on the tile map and stores them in checkpointsArray
     */
     #generateCheckpoints() {
        let checkpointOffset = Math.trunc((this.innerTrackPts.length - 2) / this.numCheckpoints);

        // add checkpoints equally spaced along inner track points
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

    /**
     * determines if the the player has collided with a checkpoint
     * 
     * @param player the Player object
     * @returns true if the player's sprite collided with the current checkpoint
     */
    #checkPlayerCollision(player: Car | Bike) {
        let playerX = player.getLocX();
        let playerY = player.getLocY();

        let playerTileWidth:number = Math.trunc(playerX / this.tileDimension);
        let playerTileHeight:number = Math.trunc((-1) * playerY / this.tileDimension);

        if (playerTileHeight == this.checkpointsArray[this.currCheckpointIndex][0] && playerTileWidth == this.checkpointsArray[this.currCheckpointIndex][1]) {
            return true;
        }

        return false;
    }

    /**
     * determines how much to offset the checkpoint image to properly place it on the appropriate tile
     * since checkpoint images are smaller than the tiles themselves
     * 
     * @returns two element array of the amount to offset each checkpoint coordinate to center its image on the race track tile
     */
     #getPixelImageOffset() {
        let heightOffset:number = 0;
        let widthOffset:number = 0;

        let trackTile = this.mapArray[this.checkpointsArray[this.currCheckpointIndex][0]][this.checkpointsArray[this.currCheckpointIndex][1]];

        // to place checkpoints in the center of straight, finish, or corner tiles
        if (terrainArray.straights.includes(trackTile) || terrainArray.finishes.includes(trackTile) || terrainArray.corners.includes(trackTile)) {
            heightOffset = this.tileDimension / 2;
            widthOffset = this.tileDimension / 2; 
        } 
        else {
            // slightly different offsets for diagonal tiles because they individually each contain half non-road/grass
            if (terrainArray.diagonals.includes(trackTile)) {
                if (trackTile == terrainArray.diag_NW) {
                    heightOffset = this.tileDimension / 1.5; 
                    widthOffset = this.tileDimension / 2; 
                }
                else if (trackTile == terrainArray.diag_NE) {
                    heightOffset = this.tileDimension / 2; 
                }
                else if (trackTile == terrainArray.diag_SE) {
                    heightOffset = this.tileDimension / 3.25 ; 
                    widthOffset = this.tileDimension / 3.25;
                }
                else if (trackTile == terrainArray.diag_SW) {
                    widthOffset = this.tileDimension / 2; 
                }
            }
        }
        return [heightOffset, widthOffset];
    }
}