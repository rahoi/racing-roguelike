import terrainArray from "./TerrainArray"

export default class PlaceTiles {
    mapArray:number[][];
    // trackCoordinates:number[][];
    innerTrack:number[][];
    innerTrackString:string[];
    outerTrack:number[][];
    outerTrackString:string[];
    newOuterPts:string[];

    mapHeight:number;
    mapWidth:number;

    startIndex:number;
    startTile:number;
    playerStartPt:number[];

    isClockwise:boolean

    constructor(mapArray:number[][], innerTrack:number[][], mapHeight:number, mapWidth:number, isClockwise:boolean, startIndex:number, startTile:number) {
        this.mapArray = mapArray;
        // this.trackCoordinates = innerTrack;
        this.innerTrack = innerTrack;
        this.innerTrackString = innerTrack.map(coordinate => JSON.stringify(coordinate));
        this.outerTrack = [];
        this.outerTrackString = [];
        this.newOuterPts = [];

        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;

        this.isClockwise = isClockwise;

        this.startIndex = startIndex;
        this.startTile = startTile;
    }

    fillTrackTiles() {
        this.fillGrassTiles();
        this.placeInnerTiles(this.innerTrack, this.startIndex, this.startTile);
        console.log("done inner tiles")

        // finding outer track, then filling mapArray with road tiles
        // this.outerTrack = this.findMainOuterTrack();
        // this.fillOuterMissingPoints();
        let outerTrackArrays:{outerTrack: number[][]; outerTrackString:string[];} = this.findOuterTrackPts(this.mapArray, this.innerTrack, this.innerTrackString, this.outerTrack, this.outerTrackString);
        this.outerTrack = outerTrackArrays.outerTrack;
        this.outerTrackString = outerTrackArrays.outerTrackString;
        for (let i = 0; i < this.outerTrack.length; i++) {
            this.mapArray[this.outerTrack[i][0]][this.outerTrack[i][1]] = terrainArray.dirt;
        }

        return this.mapArray;
    }


    fillGrassTiles() {
        for (let i = 0; i < this.mapHeight; i++) {
            let temp:number[] = [];
            for (let j = 0; j < this.mapWidth; j++) {
                if (i == 0 || i == this.mapHeight - 1 || j == 0 || j == this.mapWidth - 1) {
                    temp.push(terrainArray.dirt);
                } else if (i == 1 && (j != 0 && j != 1  && j != this.mapWidth - 2 && j != this.mapWidth - 1)) {
                    temp.push(terrainArray.grass_up);
                }
                 else if (i == this.mapHeight - 2 && (j != 0 && j != 1  && j != this.mapWidth - 2 && j != this.mapWidth - 1)) {
                    temp.push(terrainArray.grass_down);
                } else {
                    if (j == 1) {
                        if (i == 0 || i == this.mapHeight - 1) {
                            continue;
                        } else if (i == 1) {
                            temp.push(terrainArray.grass_NW);
                        } else if (i == this.mapHeight - 2) {
                            temp.push(terrainArray.grass_SW);
                        } else {
                            temp.push(terrainArray.grass_left);
                        }
                    } else if (j == this.mapWidth - 2) {
                        if (i == 0 || i == this.mapHeight - 1) {
                            continue;
                        } else if (i == 1) {
                            temp.push(terrainArray.grass_NE);
                        } else if (i == this.mapHeight - 2) {
                            temp.push(terrainArray.grass_SE);
                        } else {
                            temp.push(terrainArray.grass_right);
                        }
                    } else {
                        if (i == 0 || i == this.mapHeight - 1 || j == 0 || j == this.mapWidth - 1) {
                            continue;
                        }
                        temp.push(terrainArray.grass); 
                    }  
                }              
            }
            this.mapArray.push(temp)
        }

    }

    placeInnerTiles(innerTrack:number[][], startIndex:number, startTile:number) {
        let prev:number[];
        let curr:number[];
        let next:number[];
        let prevprev:number[];
        let nextnext:number[];

        for (let i = 1; i < innerTrack.length; i++) {
            prevprev = (i == 1) ? innerTrack[innerTrack.length - 2] : innerTrack[i - 2];
            prev = innerTrack[i - 1];
            curr = innerTrack[i];
            next = (i < innerTrack.length - 1) ? innerTrack[i + 1] : innerTrack[1];

            if (i < innerTrack.length - 2) {
                nextnext = innerTrack[i + 2];
            } else if (i == innerTrack.length - 2) {
                nextnext = innerTrack[1];
            } else {
                nextnext = innerTrack[2];
            }


            if (i == startIndex) {
                this.mapArray[curr[0]][curr[1]] = startTile;

            } else {
                this.mapArray[curr[0]][curr[1]] = this.findInnerTile(prevprev, prev, curr, next, nextnext);
            }
            
            prevprev = prev;
            prev = curr;
        }

        // replace i = 1 tile && i = 2 in case their tiles change after placing the rest
        this.mapArray[curr[0]][curr[1]] = this.findInnerTile(innerTrack[innerTrack.length - 2], innerTrack[0], innerTrack[1], innerTrack[2], innerTrack[3]);
        this.mapArray[curr[0]][curr[1]] = this.findInnerTile(innerTrack[0], innerTrack[1], innerTrack[2], innerTrack[3], innerTrack[4]);
    }

    findInnerTile(prevprev: number[], prev:number[], curr:number[], next:number[], nextnext:number[]) {
        let tile:number;
        let prev_array:number[] = [];

        // filling straight tiles
        if (prev[1] < curr[1] && curr[1] < next[1]) { // 3 tiles in a horizontal row (increasing)
            tile = this.isClockwise ? terrainArray.straight_down : terrainArray.straight_up;
        } 
        else if (prev[1] > curr[1] && curr[1] > next[1]) {
            tile = this.isClockwise ? terrainArray.straight_up : terrainArray.straight_down;
        } 
        else if (prev[0] > curr[0] && curr[0] > next[0]) {
            tile = this.isClockwise ? terrainArray.straight_right : terrainArray.straight_left;
        } 
        else if (prev[0] < curr[0] && curr[0] < next[0]) {
            tile = this.isClockwise ? terrainArray.straight_left : terrainArray.straight_right;
        }

        // filling diagonal/corner tiles
        else if ((prev[1] < curr[1] && curr[0] > next[0]) || (prev[0] < curr[0] && curr[1] > next[1])) {
            prev_array = [terrainArray.straight_left, terrainArray.straight_up, terrainArray.corner_NE, terrainArray.corner_SW, terrainArray.diag_NW];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_NW;
            } else {
                tile = terrainArray.diag_SE;
            }
        }
        else if ((prev[0] < curr[0] && curr[1] < next[1]) || (prev[1] > curr[1] && curr[0] > next[0])) {
            prev_array = [terrainArray.straight_right, terrainArray.straight_up, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_NE];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_NE;
            } else {
                tile = terrainArray.diag_SW;
            }        
        }
        else if ((prev[1] > curr[1] && curr[0] < next[0]) || (prev[0] > curr[0] && curr[1] < next[1])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_right, terrainArray.corner_SW, terrainArray.corner_NE, terrainArray.diag_SE];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_SE;
            } else {
                tile = terrainArray.diag_NW;
            }        
        }
        else if ((prev[0] > curr[0] && curr[1] > next[1]) || (prev[1] < curr[1] && curr[0] < next[0])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_left, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_SW];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                tile = terrainArray.corner_SW;
            } else {
                tile = terrainArray.diag_NE;
            }        
        }

        return tile;
    }

    findOuterTrackPts(mapArray:number[][], innerTrack:number[][], innerTrackString:string[], outerTrack:number[][], outerTrackString:string[]) {
        let innerCoord:number[];
        let innerTile:number;

        for (let i = 0; i < innerTrack.length; i++) {
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
                // this.outerTrackPts.push(tempCoord);
                // this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
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
                // this.outerTrackPts.push(tempCoord);
                // this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                    outerTrack.push(tempCoord);
                    outerTrackString.push(JSON.stringify(tempCoord));
                }
            }
            // if inner tile is corner
            else if (terrainArray.corners.includes(innerTile)) {
                // console.log("corner")
                if (innerTile == terrainArray.corner_NW) {
                    // since inner corner tiles will result in more than one outer tile if the inner corner creates a convex shape
                    // push first outer tile on the corner
                    // console.log("nw")

                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] + 1, innerCoord[1]];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                        } 
                        else {
                            tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                    // tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] + 1, innerCoord[1]];
                    // if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                    //     this.outerTrackPts.push(tempCoord);
                    //     this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                    // }

                    // // push second outer tile on the corner
                    // tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                    // if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                    //     this.outerTrackPts.push(tempCoord);
                    //     this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                    // }
                    // this.outerTrackPts.push(tempCoord);

                    // // push third outer tile on the corner
                    // tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                    // this.outerTrackPts.push(tempCoord);
                } 
                else if (innerTile == terrainArray.corner_NE) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] + 1, innerCoord[1] - 1];
                        } 
                        else {
                            tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] + 1, innerCoord[1]];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                } 
                else if (innerTile == terrainArray.corner_SE) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] - 1, innerCoord[1]];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] - 1, innerCoord[1] - 1];
                        } 
                        else {
                            tempCoord = this.isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                }
                else if (innerTile == terrainArray.corner_SW) {
                    for (let j = 0; j < 3; j++) {
                        if (j == 0) {
                            tempCoord = this.isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                        }
                        else if (j == 1) {
                            tempCoord = [innerCoord[0] - 1, innerCoord[1] + 1];
                        } 
                        else {
                            tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] - 1, innerCoord[1]];
                        }

                        if (!outerTrackString.includes(JSON.stringify(tempCoord)) && !innerTrackString.includes(JSON.stringify(tempCoord))) {
                            outerTrack.push(tempCoord);
                            outerTrackString.push(JSON.stringify(tempCoord));
                        }
                    }
                }
            }
        }

        return {outerTrack, outerTrackString};
    }

}