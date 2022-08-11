import type {coordinate} from "./coordinateType"
import terrainArray from "./TerrainArray"

/**
 * PlaceTiles places road/terrain tiles in the map array for the Tilemap from the inner track array, 
 * finds points on the outer track, and then fills in those outer track points with tiles
 */
export default class PlaceTrackTiles {
    mapArray:number[][];
    trackCoordinates:number[][];    // to store all points on the race track, both inner and outer
    innerTrack:number[][];
    innerTrackString:string[];
    outerTrack:number[][];
    outerTrackString:string[];

    outerStartLinePt:number[];
    outerStartTile:number;

    outerRim:number[][];
    neighborMap:Map<string, coordinate>;

    mapHeight:number;
    mapWidth:number;

    innerStartIndex:number;
    innerStartTile:number;
    playerStartPt:number[];

    isClockwise:boolean;

    /**
     * stores data for filling the Tilemap map array and generating the outer track points
     * 
     * @param innerTrack array of inner track points
     * @param mapHeight height of map in tiles
     * @param mapWidth width of map in tiles
     * @param isClockwise whether the track runs clockwise
     * @param innerStartIndex index of the start line in the inner track points array
     * @param startTile the value of the start tile (from the spritesheet)
     */
    constructor(innerTrack:number[][], mapHeight:number, mapWidth:number, isClockwise:boolean, innerStartIndex:number, startTile:number) {
        this.trackCoordinates = [];
        this.innerTrack = innerTrack;
        this.innerTrackString = innerTrack.map(coordinate => JSON.stringify(coordinate));
        this.outerTrack = [];
        this.outerTrackString = [];
        this.outerRim = [];
        this.neighborMap = new Map;

        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;

        this.isClockwise = isClockwise;

        this.innerStartIndex = innerStartIndex;
        this.innerStartTile = startTile;
    }

    /**
     * fills the map array with terrain/road tiles and generates the outer track points
     * 
     * @returns array of tiles for the Tilemap to draw the road/map
     */
    fillTrackTiles() {
        // fill entire map with dirt/glass tiles
        let mapArray = [];
        mapArray = this.#fillGrassTiles(mapArray, this.mapHeight, this.mapWidth);

        // place inner track tiles on the map
        mapArray = this.#placeInnerTiles(mapArray, this.isClockwise, this.innerTrack, this.innerStartIndex, this.innerStartTile);

        // finding outer track using inner track tiles
        let outerTrackArrays:{trackCoordinates:number[][]; outerTrack:number[][]; outerTrackString:string[];} = this.#findOuterTrackPtsFromInner(mapArray, this.isClockwise, this.innerTrack, this.innerTrackString, this.outerTrack, this.outerTrackString);
        this.trackCoordinates = outerTrackArrays.trackCoordinates;
        this.outerTrack = outerTrackArrays.outerTrack;
        this.outerTrackString = outerTrackArrays.outerTrackString;

        // fill outer track points with dirt tiles
        for (let i = 0; i < this.outerTrack.length; i++) {
            mapArray[this.outerTrack[i][0]][this.outerTrack[i][1]] = terrainArray.dirt;
        }

        // get map of each track points neighbors that are also on the track
        this.neighborMap = this.#findTrackNeighbors(this.trackCoordinates);
        
        // places outer tiles on the map array, returns the map array and an array of all outer track points along the outer rim of the track
        let outerTrack:{mapArray:number[][]; outerRim:number[][]; outerStartTile:number; outerStartPt:number[]} = this.#placeOuterTiles(mapArray, this.outerTrack, this.outerTrackString, this.neighborMap, this.isClockwise, this.innerTrack, this.innerStartIndex, this.innerStartTile);
        mapArray = outerTrack.mapArray;
        this.outerRim = outerTrack.outerRim;
        this.outerStartTile = outerTrack.outerStartTile;
        this.outerStartLinePt = outerTrack.outerStartPt;

        this.mapArray = mapArray;
        return mapArray;
    }

    /**
     * returns the Map with track coordinates as keys and type coordinate as values
     * 
     * @returns Map of each track points neighbors
     */
    getNeighborMap() {
        return this.neighborMap;
    }

    /**
     * returns an array of all points in the race track
     * 
     * @returns array of track points
     */
    getAllTrackPts() {
        return this.trackCoordinates;
    }

    /**
     * returns an array of the points that are on the outer rim of the race track
     * (as some outer track points are not along the outside edge of the track)
     * 
     * @returns array of points on the outer rim
     */
    getOuterRim() {
        return this.outerRim;
    }

    /**
     * returns the coordinate of the start line that is in the outer track array
     * 
     * @returns the coordinate of start line on the outer track
     */
    getOuterStartLineCoord() {
        return this.outerStartLinePt;
    }

    /**
     * returns the value of the start line tile on the outer track array (from the spritesheet)
     * 
     * @returns the tile at the start line on the outer track
     */
    getOuterStartTile() {
        return this.outerStartTile;
    }

    // ----------------------------------Priavte helper functions----------------------------------

    /**
     * fills an array for the map, later used to create the Phaser Tilemap for each level, with grass tiles,
     * and adds a dirt border around the outer border of the map
     * 
     * @param mapArray array of the map for the Phaser Tilemap
     * @param mapHeight height of the map in tiles
     * @param mapWidth width of the map in tiles
     * @returns the map array filled with grass tiles
     */
    #fillGrassTiles(mapArray:number[][], mapHeight:number, mapWidth:number) {
        for (let i = 0; i < mapHeight; i++) {
            let temp:number[] = [];
            for (let j = 0; j < mapWidth; j++) {
                if (i == 0 || i == mapHeight - 1 || j == 0 || j == mapWidth - 1) {
                    temp.push(terrainArray.dirt);
                } else if (i == 1 && (j != 0 && j != 1  && j != mapWidth - 2 && j != mapWidth - 1)) {
                    temp.push(terrainArray.grass_up);
                }
                 else if (i == mapHeight - 2 && (j != 0 && j != 1  && j != mapWidth - 2 && j != mapWidth - 1)) {
                    temp.push(terrainArray.grass_down);
                } else {
                    if (j == 1) {
                        if (i == 0 || i == mapHeight - 1) {
                            continue;
                        } else if (i == 1) {
                            temp.push(terrainArray.grass_NW);
                        } else if (i == mapHeight - 2) {
                            temp.push(terrainArray.grass_SW);
                        } else {
                            temp.push(terrainArray.grass_left);
                        }
                    } else if (j == mapWidth - 2) {
                        if (i == 0 || i == mapHeight - 1) {
                            continue;
                        } else if (i == 1) {
                            temp.push(terrainArray.grass_NE);
                        } else if (i == mapHeight - 2) {
                            temp.push(terrainArray.grass_SE);
                        } else {
                            temp.push(terrainArray.grass_right);
                        }
                    } else {
                        if (i == 0 || i == mapHeight - 1 || j == 0 || j == mapWidth - 1) {
                            continue;
                        }
                        temp.push(terrainArray.grass); 
                    }  
                }              
            }
            mapArray.push(temp)
        }

        return mapArray;
    }

    /**
     * places tiles corresponding to the inner track on map array
     * 
     * @param mapArray array of the map for the Phaser Tilemap
     * @param isClockwise whether the track runs clockwise
     * @param innerTrack array of the inner track points
     * @param startIndex index of the start line on the inner track
     * @param startTile values of the start line tile
     * @returns the map array with inner track tiles filled in
     */
    #placeInnerTiles(mapArray:number[][], isClockwise:boolean, innerTrack:number[][], startIndex:number, startTile:number) {
        let prevIndex:number;
        let currIndex:number;
        let nextIndex:number;

        let prev:number[];
        let curr:number[];
        let next:number[];


        for (let i = 0; i < innerTrack.length - 1; i++) {
            // offset index to start placing inner tiles since the prev tile will always be a straight tile
            // this avoids misplacing the first tile if it is a straight tile
            prevIndex = (i - 1 + startIndex) % (innerTrack.length - 1);
            currIndex =  (i + startIndex) % (innerTrack.length - 1);
            nextIndex = (i + 1 + startIndex) % (innerTrack.length - 1);

            prev = innerTrack[prevIndex];
            curr = innerTrack[currIndex];
            next = innerTrack[nextIndex];

            if (currIndex == startIndex) {
                mapArray[curr[0]][curr[1]] = startTile;

            } else {
                mapArray[curr[0]][curr[1]] = this.#findTile(mapArray, isClockwise, prev, curr, next);
            }
        }
        return mapArray;
    }

    /**
     * determines the tile value (from the spritesheet) that the current tile should be,
     * based on the location of the tiles surrounding it
     * 
     * @param mapArray array of the map for the Phaser Tilemap
     * @param isClockwise whether the track runs clockwise
     * @param prev previous coordinate in the track
     * @param curr current coordinate/point to determine tile value
     * @param next next coordinate in the track
     * @returns the value of the tile corresponding to the coordinate on the track
     */
    #findTile(mapArray:number[][], isClockwise:boolean, prev:number[], curr:number[], next:number[]) {
        let tile:number;
        let prev_array:number[] = [];

        // filling straight tiles
        if (prev[1] < curr[1] && curr[1] < next[1]) { // 3 tiles in a horizontal row (increasing)
            tile = isClockwise ? terrainArray.straight_down : terrainArray.straight_up;
        } 
        else if (prev[1] > curr[1] && curr[1] > next[1]) {
            tile = isClockwise ? terrainArray.straight_up : terrainArray.straight_down;
        } 
        else if (prev[0] > curr[0] && curr[0] > next[0]) {
            tile = isClockwise ? terrainArray.straight_right : terrainArray.straight_left;
        } 
        else if (prev[0] < curr[0] && curr[0] < next[0]) {
            tile = isClockwise ? terrainArray.straight_left : terrainArray.straight_right;
        }

        // filling diagonal/corner tiles
        else if ((prev[1] < curr[1] && curr[0] > next[0]) || (prev[0] < curr[0] && curr[1] > next[1])) {
            prev_array = [terrainArray.straight_left, terrainArray.straight_up, terrainArray.finish_left, terrainArray.finish_up, terrainArray.corner_NE, terrainArray.corner_SW, terrainArray.diag_NW];

            if (prev_array.includes(mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_NW;
            } else {
                tile = terrainArray.diag_SE;
            }
        }
        else if ((prev[1] > curr[1] && curr[0] > next[0]) || (prev[0] < curr[0] && curr[1] < next[1])) {
            prev_array = [terrainArray.straight_right, terrainArray.straight_up, terrainArray.finish_right, terrainArray.finish_up, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_NE];

            if (prev_array.includes(mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_NE;
            } else {
                tile = terrainArray.diag_SW;
            }        
        }
        else if ((prev[1] > curr[1] && curr[0] < next[0]) || (prev[0] > curr[0] && curr[1] < next[1])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_right, terrainArray.finish_down, terrainArray.finish_right, terrainArray.corner_SW, terrainArray.corner_NE, terrainArray.diag_SE];

            if (prev_array.includes(mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_SE;
            } else {
                tile = terrainArray.diag_NW;
            }        
        }
        else if ((prev[1] < curr[1] && curr[0] < next[0]) || (prev[0] > curr[0] && curr[1] > next[1])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_left, terrainArray.finish_down, terrainArray.finish_left, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_SW];

            if (prev_array.includes(mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_SW;
            } else {
                tile = terrainArray.diag_NE;
            }        
        }
        
        return tile;
    }

    /**
     * creates arrays that contain all race track points (trackCoordinates), the outer track points (outerTrack), 
     * and the points along the outer edge of the outer track (outerRim)
     * 
     * @param mapArray array of the map for the Phaser Tilemap
     * @param isClockwise whether the track runs clockwise
     * @param innerTrack array of inner track points
     * @param innerTrackString array of inner track points as strings
     * @param outerTrack array of outer track points
     * @param outerTrackString array of outer track points as strings
     * @returns trackCoordinates: all points in the race track, outerTrack: all points in the outer portion of the race track, outerRim: points along the outer edge of the outer track points
     */
    #findOuterTrackPtsFromInner(mapArray:number[][], isClockwise:boolean, innerTrack:number[][], innerTrackString:string[], outerTrack:number[][], outerTrackString:string[]) {
        let trackCoordinates:number[][] = []; // creating array of all track coordinates
        let innerCoord:number[];
        let innerTile:number;

        for (let i = 0; i < innerTrack.length; i++) {
            trackCoordinates.push(innerTrack[i]);
            innerCoord = innerTrack[i];
            innerTile = mapArray[innerCoord[0]][innerCoord[1]];

            let tempCoord:number[];

            // if inner tile is straight
            if (terrainArray.straights.includes(innerTile) || terrainArray.finishes.includes(innerTile)) {
                if (innerTile == terrainArray.straight_up || innerTile == terrainArray.finish_up) {
                    tempCoord = [innerCoord[0] + 1, innerCoord[1]];
                } 
                else if (innerTile == terrainArray.straight_down || innerTile == terrainArray.finish_down) {
                    tempCoord = [innerCoord[0] - 1, innerCoord[1]];
                } 
                else if (innerTile == terrainArray.straight_left || innerTile == terrainArray.finish_left) {
                    tempCoord = [innerCoord[0], innerCoord[1] + 1];
                }
                else if (innerTile == terrainArray.straight_right || innerTile == terrainArray.finish_right) {
                    tempCoord = [innerCoord[0], innerCoord[1] - 1];
                }
                if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                    trackCoordinates.push(tempCoord);
                    outerTrack.push(tempCoord);
                    outerTrackString.push(JSON.stringify(tempCoord));
                }
            }
            // if inner tile is diagonal
            else if (terrainArray.diagonals.includes(innerTile)) {
                if (innerTile == terrainArray.diag_NW) {
                    tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                } 
                else if (innerTile == terrainArray.diag_NE) {
                    tempCoord = [innerCoord[0] + 1, innerCoord[1] - 1];
                } 
                else if (innerTile == terrainArray.diag_SE) {
                    tempCoord = [innerCoord[0] - 1, innerCoord[1] - 1];
                }
                else if (innerTile == terrainArray.diag_SW) {
                    tempCoord = [innerCoord[0] - 1, innerCoord[1] + 1];
                }
                if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                    trackCoordinates.push(tempCoord);
                    outerTrack.push(tempCoord);
                    outerTrackString.push(JSON.stringify(tempCoord));
                }
            }
            // if inner tile is corner
            else if (terrainArray.corners.includes(innerTile)) {
                if (innerTile == terrainArray.corner_NW) {
                    // since inner corner tiles will result in more than one outer tile if the inner corner creates a convex shape

                    for (let j = 0; j < 3; j++) {
                        if (j == 0) { // first outer tile on the corner
                            tempCoord = isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] + 1, innerCoord[1]];
                        }
                        else if (j == 1) {  // second outer tile on the corner
                            tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                        } 
                        else { // third outer tile on the corner
                            tempCoord = isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            trackCoordinates.push(tempCoord);
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                } 
                else if (innerTile == terrainArray.corner_NE) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] + 1, innerCoord[1] - 1];
                        } 
                        else {
                            tempCoord = isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] + 1, innerCoord[1]];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            trackCoordinates.push(tempCoord);
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                } 
                else if (innerTile == terrainArray.corner_SE) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] - 1, innerCoord[1]];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] - 1, innerCoord[1] - 1];
                        } 
                        else {
                            tempCoord = isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            trackCoordinates.push(tempCoord);
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                }
                else if (innerTile == terrainArray.corner_SW) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] - 1, innerCoord[1] + 1];
                        } 
                        else {
                            tempCoord = isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] - 1, innerCoord[1]];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            trackCoordinates.push(tempCoord);
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                }
            }
        }
        return {trackCoordinates, outerTrack, outerTrackString};
    }

    /**
     * returns a map where the keys are all points in the race track and the values are of the type coordinates,
     * which holds the orthogonal neighbors of the track point
     * 
     * @param trackCoordinates array of all race track points
     * @returns Map of all track points and the corresponding type coordinates object
     */
    #findTrackNeighbors(trackCoordinates:number[][]) {
        let neighborMap:Map<string, coordinate> = new Map;
        for (let i = 0; i < trackCoordinates.length - 1; i++) {
            let stringKey:string = JSON.stringify(trackCoordinates[i]);
            let tempCoord:coordinate;

            if (neighborMap.get(stringKey) == null) {
                tempCoord = {
                    index: i,
                    numNeighbors: 0
                };
                neighborMap.set(stringKey, tempCoord);
            } 
        }

        for (let i = 0; i < trackCoordinates.length; i++) {
            let possibleNeighbors:number[][] = this.#findNeighbors(trackCoordinates[i]);

            for (let j = 0; j < possibleNeighbors.length; j++) {
                let neighborKey = JSON.stringify(possibleNeighbors[j]);
                let tempCoord:coordinate | undefined = neighborMap.get(neighborKey);
                                
                if (tempCoord != null) { 
                    if (possibleNeighbors[j][0] < trackCoordinates[i][0]) {
                        if (tempCoord.downVert == undefined) {
                            tempCoord.downVert = trackCoordinates[i];
                            tempCoord.numNeighbors++;
                        }
                    } else if (possibleNeighbors[j][0] > trackCoordinates[i][0]) {
                        if (tempCoord.upVert == undefined) {
                            tempCoord.upVert = trackCoordinates[i];
                            tempCoord.numNeighbors++;
                        }
                    } else if (possibleNeighbors[j][1] < trackCoordinates[i][1]) {
                        if (tempCoord.rightHorz == undefined) {
                            tempCoord.rightHorz = trackCoordinates[i];
                            tempCoord.numNeighbors++;
                        }
                    } else if (possibleNeighbors[j][1] > trackCoordinates[i][1]) {
                        if (tempCoord.leftHorz == undefined) {
                            tempCoord.leftHorz = trackCoordinates[i];
                            tempCoord.numNeighbors++;
                        }
                    }
                    neighborMap.set(neighborKey, tempCoord);
                }
            }
        }
        return neighborMap;
    }

    /**
     * finds the orthogonal neighbors of the given coordinate
     * 
     * @param coordinate a coordinate on the track
     * @returns array of the orthogonal neighbors of the coordinate
     */
    #findNeighbors(coordinate:number[]) {
        let neighbors:number[][] = [];

        let up:number[] = [coordinate[0] - 1, coordinate[1]];
        let down:number[] = [coordinate[0] + 1, coordinate[1]];
        let left:number[] = [coordinate[0], coordinate[1] - 1];
        let right:number[] = [coordinate[0], coordinate[1] + 1];

        neighbors.push(up, down, left, right);

        return neighbors;
    }

    /**
     * places tiles into the map array for points on the outer track
     * 
     * @param mapArray array of the map for the Phaser Tilemap
     * @param outerTrack array of outer track points
     * @param outerTrackString array of outer track points as strings
     * @param neighborMap Map of coordinates and their orthogonal neighbors
     * @param isClockwise whether the track runs clockwise
     * @param innerTrack array of inner track points
     * @param innerStartIndex array of inner track points as strings
     * @param innerStartTile value of inner track start lines tile 
     * @returns mapArray: array filled in with outer track tiles, outerRim: array of points along the outer edge of the track, outerStartTile: tile at the outer track start line, outerStartPt: outer start line coordinate
     */
    #placeOuterTiles(mapArray:number[][], outerTrack:number[][], outerTrackString:string[], neighborMap:Map<string, coordinate>, isClockwise:boolean, innerTrack:number[][], innerStartIndex:number, innerStartTile:number) {
        let outerRim:number[][] = JSON.parse(JSON.stringify(outerTrack));   // holds track pts on the outer rim of the race track
        let outerRimString:string[] = [];

        for (let i = 0; i <  outerTrack.length; i++) {
            let outerCoordKey = JSON.stringify(outerTrack[i]);

            let isBlank:boolean = this.#determineIfBlank(outerCoordKey, outerTrackString, neighborMap);
           
            if (isBlank) {
                mapArray[outerTrack[i][0]][outerTrack[i][1]] = terrainArray.blank_road;
                outerRim.splice(i, 1); // removes blank tile coordinate from outer rim
            } else {
                outerRimString.push(JSON.stringify(outerTrack[i]));
            }
        }

        // push first pt in outerRim to end to complete the loop
        outerRim.push(outerRim[0]);

        // placing start tile on outer track
        let outerStartTile:number;
        let outerStartPt:number[] = [];

        if (innerStartTile == terrainArray.finish_up) {
            outerStartTile = terrainArray.finish_down;
            outerStartPt = [innerTrack[innerStartIndex][0] + 1, innerTrack[innerStartIndex][1]];
        }
        else if (innerStartTile == terrainArray.finish_down) {
            outerStartTile = terrainArray.finish_up;
            outerStartPt = [innerTrack[innerStartIndex][0] - 1, innerTrack[innerStartIndex][1]];
        }
        else if (innerStartTile == terrainArray.finish_left) {
            outerStartTile = terrainArray.finish_right;
            outerStartPt = [innerTrack[innerStartIndex][0], innerTrack[innerStartIndex][1] + 1];
        }
        else { // if innerStartTile is terrainArray.finish_right
            outerStartTile = terrainArray.finish_left;
            outerStartPt = [innerTrack[innerStartIndex][0], innerTrack[innerStartIndex][1] - 1];
        }
        mapArray[outerStartPt[0]][outerStartPt[1]] = outerStartTile;

        let prevIndex:number;
        let currIndex:number;
        let nextIndex:number;

        let prev:number[];
        let curr:number[];
        let next:number[];
        for (let i = 0; i < outerRim.length - 1; i++) {
            prevIndex = (i - 1 + innerStartIndex) % (outerRim.length - 1);
            currIndex =  (i + innerStartIndex) % (outerRim.length - 1);
            nextIndex = (i + 1 + innerStartIndex) % (outerRim.length - 1);

            prev = outerRim[prevIndex];
            curr = outerRim[currIndex];
            next = outerRim[nextIndex];

            if (JSON.stringify(curr) != JSON.stringify(outerStartPt)) {
                mapArray[curr[0]][curr[1]] = this.#findTile(mapArray, !isClockwise, prev, curr, next);
            }
        }
        return {mapArray, outerRim, outerStartTile, outerStartPt};
    }

    /**
     * determines whether the coordinate on the outer track should be a blank road tile
     * 
     * @param outerCoordKey coordinate on the outer track as a string
     * @param outerTrackString array of outer track points as strings
     * @param neighborMap Map of coordinates and their orthogonal neighbors
     * @returns true if the tile should be a blank road tile
     */
    #determineIfBlank(outerCoordKey:string, outerTrackString:string[], neighborMap:Map<string, coordinate>) {
        let coordinate:coordinate | undefined = neighborMap.get(outerCoordKey);
        let numOuterNeighbors = 0;

        // sets tile as blank road if the track pt has 4 neighbors and at least one of them is on a point on the outer track
        if (coordinate != null && coordinate.numNeighbors == 4) {
            let upCoordString = JSON.stringify(coordinate.upVert);
            let neighborUp:coordinate | undefined = neighborMap.get(upCoordString);

            let downCoordString = JSON.stringify(coordinate.downVert);
            let neighborDown:coordinate | undefined = neighborMap.get(downCoordString);

            let leftCoordString = JSON.stringify(coordinate.leftHorz);
            let neighborLeft:coordinate | undefined = neighborMap.get(leftCoordString);

            let rightCoordString = JSON.stringify(coordinate.rightHorz);
            let neighborRight:coordinate | undefined = neighborMap.get(rightCoordString);

            // counts number of neighbors on the outer track
            if (outerTrackString.includes(upCoordString)) {
                numOuterNeighbors++;
            }
            if (outerTrackString.includes(downCoordString)) {
                numOuterNeighbors++;
            }
            if (outerTrackString.includes(leftCoordString)) {
                numOuterNeighbors++;
            }
            if (outerTrackString.includes(rightCoordString)) {
                numOuterNeighbors++;
            }
        }

        // tile should be blank if there is only one neighbor on the outer track
        return (numOuterNeighbors == 1);
    }
}