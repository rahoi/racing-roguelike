import terrainArray from "./TerrainArray.js"

export default class PlaceTiles {
    mapArray:number[][];
    trackCoordinates:number[][];
    innerPtsString:string[];
    outerTrack:number[][];
    outerTrackPts:number[][];
    outerTrackPtsString:string[];
    newOuterPts:string[];

    mapHeight:number;
    mapWidth:number;

    startIndex:number;
    startTile:number;
    playerStartPt:number[];

    isClockwise:boolean

    constructor(mapArray:number[][], trackCoordinates:number[][], mapHeight:number, mapWidth:number, isClockwise:boolean, startIndex:number, startTile:number) {
        this.mapArray = mapArray;
        this.trackCoordinates = trackCoordinates;
        this.innerPtsString = trackCoordinates.map(coord => JSON.stringify(coord));
        this.outerTrackPts = [];
        this.outerTrackPtsString = [];
        this.newOuterPts = [];

        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;

        this.isClockwise = isClockwise;

        this.startIndex = startIndex;
        this.startTile = startTile;
    }

    fillTrackTiles() {
        this.fillGrassTiles();
        console.log("done grass")
        this.placeTiles(this.startIndex, this.startTile);
        console.log("done inner tiles")

        // finding outer track, then filling mapArray with road tiles
        // this.outerTrack = this.findMainOuterTrack();
        // this.fillOuterMissingPoints();
        this.findOuterTrackPts();
        // for (let i = 0; i < this.outerTrackPts.length; i++) {
        //     this.mapArray[this.outerTrackPts[i][0]][this.outerTrackPts[i][1]] = terrainArray.blank_road;
        // }

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

    placeTiles(startIndex:number, startTile:number) {
        this.startIndex = startIndex;
        this.startTile = startTile;

        let prev:number[];
        let curr:number[];
        let next:number[];
        let prevprev:number[];
        let nextnext:number[];

        for (let i = 1; i < this.trackCoordinates.length; i++) {
            prevprev = (i == 1) ? this.trackCoordinates[this.trackCoordinates.length - 2] : this.trackCoordinates[i - 2];
            prev = this.trackCoordinates[i - 1];
            curr = this.trackCoordinates[i];
            next = (i < this.trackCoordinates.length - 1) ? this.trackCoordinates[i + 1] : this.trackCoordinates[1];

            if (i < this.trackCoordinates.length - 2) {
                nextnext = this.trackCoordinates[i + 2];
            } else if (i == this.trackCoordinates.length - 2) {
                nextnext = this.trackCoordinates[1];
            } else {
                nextnext = this.trackCoordinates[2];
            }


            if (i == startIndex) {
                this.mapArray[curr[0]][curr[1]] = startTile;

            } else {
                this.placeInnerTiles(prevprev, prev, curr, next, nextnext);
            }
            
            prevprev = prev;
            prev = curr;
        }

        // replace i = 1 tile && i = 2 in case their tiles change after placing the rest
        this.placeInnerTiles(this.trackCoordinates[this.trackCoordinates.length - 2], this.trackCoordinates[0], this.trackCoordinates[1], this.trackCoordinates[2], this.trackCoordinates[3]);
        this.placeInnerTiles(this.trackCoordinates[0], this.trackCoordinates[1], this.trackCoordinates[2], this.trackCoordinates[3], this.trackCoordinates[4]);
    }

    placeInnerTiles(prevprev: number[], prev:number[], curr:number[], next:number[], nextnext:number[]) {
        let prev_array:number[] = [];

        // filling straight tiles
        if (prev[1] < curr[1] && curr[1] < next[1]) { // 3 tiles in a horizontal row (increasing)
            this.mapArray[curr[0]][curr[1]] = this.isClockwise ? terrainArray.straight_down : terrainArray.straight_up;
        } 
        else if (prev[1] > curr[1] && curr[1] > next[1]) {
            this.mapArray[curr[0]][curr[1]] = this.isClockwise ? terrainArray.straight_up : terrainArray.straight_down;
        } 
        else if (prev[0] > curr[0] && curr[0] > next[0]) {
            this.mapArray[curr[0]][curr[1]] = this.isClockwise ? terrainArray.straight_right : terrainArray.straight_left;
        } 
        else if (prev[0] < curr[0] && curr[0] < next[0]) {
            this.mapArray[curr[0]][curr[1]] = this.isClockwise ? terrainArray.straight_left : terrainArray.straight_right;
        }

        // filling diagonal/corner tiles
        else if ((prev[1] < curr[1] && curr[0] > next[0]) || (prev[0] < curr[0] && curr[1] > next[1])) {
            prev_array = [terrainArray.straight_left, terrainArray.straight_up, terrainArray.corner_NE, terrainArray.corner_SW, terrainArray.diag_NW];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                this.mapArray[curr[0]][curr[1]] = terrainArray.corner_NW;
            } else {
                this.mapArray[curr[0]][curr[1]] = terrainArray.diag_SE;
            }
        }
        else if ((prev[0] < curr[0] && curr[1] < next[1]) || (prev[1] > curr[1] && curr[0] > next[0])) {
            prev_array = [terrainArray.straight_right, terrainArray.straight_up, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_NE];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                this.mapArray[curr[0]][curr[1]] = terrainArray.corner_NE;
            } else {
                this.mapArray[curr[0]][curr[1]] = terrainArray.diag_SW;
            }        
        }
        else if ((prev[1] > curr[1] && curr[0] < next[0]) || (prev[0] > curr[0] && curr[1] < next[1])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_right, terrainArray.corner_SW, terrainArray.corner_NE, terrainArray.diag_SE];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                this.mapArray[curr[0]][curr[1]] = terrainArray.corner_SE;
            } else {
                this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NW;
            }        
        }
        else if ((prev[0] > curr[0] && curr[1] > next[1]) || (prev[1] < curr[1] && curr[0] < next[0])) {
            prev_array = [terrainArray.straight_down, terrainArray.straight_left, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_SW];

            if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
                this.mapArray[curr[0]][curr[1]] = terrainArray.corner_SW;
            } else {
                this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NE;
            }        
        }
    }



    findOuterTrackPts() {
        let innerCoord:number[];
        let innerTile:number;

        for (let i = 0; i < this.trackCoordinates.length; i++) {
            innerCoord = this.trackCoordinates[i];
            innerTile = this.mapArray[innerCoord[0]][innerCoord[1]];

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
                if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord)) && !this.innerPtsString.includes(JSON.stringify(tempCoord))) {
                    this.outerTrackPts.push(tempCoord);
                    this.outerTrackPtsString.push(JSON.stringify(tempCoord));
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
                if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord)) && !this.innerPtsString.includes(JSON.stringify(tempCoord))) {
                    this.outerTrackPts.push(tempCoord);
                    this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                }
            }
            // if inner tile is corner
            else if (terrainArray.corners.includes(innerTile)) {
                console.log("corner")
                // if (innerTile == terrainArray.corner_NW) {
                //     // since inner corner tiles will result in more than one outer tile if the inner corner creates a convex shape
                //     // push first outer tile on the corner

                //     for (let j = 0; j < 3; j++) {
                //         if (j = 0) {
                //             tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] + 1, innerCoord[1]];
                //         }
                //         else if (j = 1) {
                //             tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                //         } 
                //         else if (j = 2) {
                //             tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                //         }

                //         // if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //         //     this.outerTrackPts.push(tempCoord);
                //         //     this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //         // }
                //     }
                //     // tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] + 1, innerCoord[1]];
                //     // if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //     //     this.outerTrackPts.push(tempCoord);
                //     //     this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //     // }

                //     // // push second outer tile on the corner
                //     // tempCoord = [innerCoord[0] + 1, innerCoord[1] + 1];
                //     // if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //     //     this.outerTrackPts.push(tempCoord);
                //     //     this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //     // }
                //     // this.outerTrackPts.push(tempCoord);

                //     // // push third outer tile on the corner
                //     // tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                //     // this.outerTrackPts.push(tempCoord);
                // } 
                // else if (innerTile == terrainArray.corner_NE) {
                //     for (let i = 0; i < 3; i++) {
                //         if (i = 0) {
                //             tempCoord = this.isClockwise ? [innerCoord[0] + 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                //         }
                //         else if (i = 1) {
                //             tempCoord = [innerCoord[0] + 1, innerCoord[1] - 1];
                //         } 
                //         else {
                //             tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] + 1, innerCoord[1]];
                //         }

                //         if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //             this.outerTrackPts.push(tempCoord);
                //             this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //         }
                //     }
                // } 
                // else if (innerTile == terrainArray.corner_SE) {
                //     for (let i = 0; i < 3; i++) {
                //         if (i = 0) {
                //             tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] - 1] : [innerCoord[0] - 1, innerCoord[1]];
                //         }
                //         else if (i = 1) {
                //             tempCoord = [innerCoord[0] - 1, innerCoord[1] - 1];
                //         } 
                //         else {
                //             tempCoord = this.isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] - 1];
                //         }

                //         if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //             this.outerTrackPts.push(tempCoord);
                //             this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //         }
                //     }
                // }
                // else if (innerTile == terrainArray.corner_SW) {
                //     for (let i = 0; i < 3; i++) {
                //         if (i = 0) {
                //             tempCoord = this.isClockwise ? [innerCoord[0] - 1, innerCoord[1]] : [innerCoord[0], innerCoord[1] + 1];
                //         }
                //         else if (i = 1) {
                //             tempCoord = [innerCoord[0] - 1, innerCoord[1] + 1];
                //         } 
                //         else {
                //             tempCoord = this.isClockwise ? [innerCoord[0], innerCoord[1] + 1] : [innerCoord[0] - 1, innerCoord[1]];
                //         }

                //         if (!this.outerTrackPtsString.includes(JSON.stringify(tempCoord))) {
                //             this.outerTrackPts.push(tempCoord);
                //             this.outerTrackPtsString.push(JSON.stringify(tempCoord));
                //         }
                //     }
                // }
            }
        }
    }

}