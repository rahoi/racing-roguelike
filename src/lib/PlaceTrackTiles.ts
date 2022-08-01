import terrainArray from "./TerrainArray.js"

export default class PlaceTiles {
    mapArray:number[][];
    trackCoordinates:number[][];
    outerTrack:number[][];

    mapHeight:number;
    mapWidth:number;

    startIndex:number;
    startTile:number;
    playerStartPt:number[];

    isClockwise:boolean

    constructor(mapArray:number[][], trackCoordinates:number[][], mapHeight:number, mapWidth:number, isClockwise:boolean, startIndex:number, startTile:number) {
        this.mapArray = mapArray;
        this.trackCoordinates = trackCoordinates;

        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;

        this.isClockwise = isClockwise;

        this.startIndex = startIndex;
        this.startTile = startTile;
    }

    fillTrackTiles() {
        this.fillGrassTiles();
        this.placeTiles(this.startIndex, this.startTile);
        
        // finding outer track, then filling mapArray with road tiles
        this.outerTrack = this.findOuterTrack();
        this.fillOuterMissingPoints();

        return this.mapArray;
    }


    fillGrassTiles() {
        for (let i = 0; i < this.mapHeight; i++) {
            let temp:number[] = [];
            for (let j = 0; j < this.mapWidth; j++) {
                if (i == 0 && (j != 0 && j != this.mapWidth - 1)) {
                    temp.push(terrainArray.grass_up);
                }
                
                 else if (i == this.mapHeight - 1 && (j != 0 && j != this.mapWidth - 1)) {
                    temp.push(terrainArray.grass_down);
                } else {

                    if (j == 0) {
                        if (i == 0) {
                            temp.push(terrainArray.grass_NW);
                        } else if (i == this.mapHeight - 1) {
                            temp.push(terrainArray.grass_SW);
                        } else {
                            temp.push(terrainArray.grass_left);
                        }
                    } else if (j == this.mapWidth - 1) {
                        if (i == 0) {
                            temp.push(terrainArray.grass_NE);
                        } else if (i == this.mapHeight - 1) {
                            temp.push(terrainArray.grass_SE);
                        } else {
                            temp.push(terrainArray.grass_right);
                        }
                    } else {
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

        // replace i = 1 tile 
        this.placeInnerTiles(this.trackCoordinates[this.trackCoordinates.length - 2], this.trackCoordinates[0], this.trackCoordinates[1], this.trackCoordinates[2], this.trackCoordinates[3]);

    }

    placeInnerTiles(prevprev: number[], prev:number[], curr:number[], next:number[], nextnext:number[]) {
        let prev_array:number[] = [];

        // filling straight tiles
        if (prev[1] < curr[1] && curr[1] < next[1]) { // 3 tiles in a horizontal row (increasing)
            this.mapArray[curr[0]][curr[1]] = terrainArray.straight_up;
        } 
        else if (prev[1] > curr[1] && curr[1] > next[1]) {
            this.mapArray[curr[0]][curr[1]] = terrainArray.straight_down;
        } 
        else if (prev[0] > curr[0] && curr[0] > next[0]) {
            this.mapArray[curr[0]][curr[1]] = terrainArray.straight_left;
        } 
        else if (prev[0] < curr[0] && curr[0] < next[0]) {
            this.mapArray[curr[0]][curr[1]] = terrainArray.straight_right;
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

    findOuterTrack() {
        this.outerTrack = [];
        let outerPt:number[] = [];

        let prevPrevPt:number[];
        let prevPrevTile:number;
        let prevPt:number[];
        let prevInnerTile:number;
        let currPt:number[];
        let currInnerTile:number;
        let nextPt:number[];
        let nextInnerTile:number;
        
        // setting prevPt and firstInnerTile for first pt in trackCoordinates
        prevPrevPt = this.trackCoordinates[this.trackCoordinates.length - 2];
        prevPrevTile = this.mapArray[prevPrevPt[0]][prevPrevPt[1]];
        prevPt = this.trackCoordinates[this.trackCoordinates.length - 2];
        prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];
        currPt = this.trackCoordinates[0];
        currInnerTile = this.mapArray[currPt[0]][currPt[1]];
        nextPt = this.trackCoordinates[1];
        nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

        // setting first pt in outerTrack and the tile for the first outer pt in mapArray
        this.outerTrack.push(this.findOuterPtFromInner(currPt, prevPrevTile, prevInnerTile, currInnerTile, nextInnerTile));
        // outerTrack[0] = outerPt;
        console.log("1st outer pt: ", this.outerTrack[0]);

        for (let i = 1; i < this.trackCoordinates.length - 1; i++) {
            prevPrevPt = (i == 1) ? this.trackCoordinates[this.trackCoordinates.length - 2] : this.trackCoordinates[i - 2];
            prevPrevTile = this.mapArray[prevPrevPt[0]][prevPrevPt[1]];

            prevPt = this.trackCoordinates[i - 1];
            prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];

            currPt = this.trackCoordinates[i];
            currInnerTile = this.mapArray[currPt[0]][currPt[1]];

            nextPt = this.trackCoordinates[i + 1];
            nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

            this.outerTrack.push(this.findOuterPtFromInner(currPt, prevPrevTile, prevInnerTile, currInnerTile, nextInnerTile));
        }

        // adding first pt to the end of outerTrack array to complete the loop
        this.outerTrack.push(this.outerTrack[0]);
        // console.log("outer len", outerTrack.length)
        // let tempTrack:number[][] = this.fillInTrack(outerTrack);
        // console.log("o len", tempTrack.length)
        // for (let i = 0; i < trackCoordinates.length; i++) {
        //         console.log("(", outerPt[i][0], ", ", outerPt[i][1], ")  --> ", i);
        // } 

        // this.fillOuterMissingPoints(outerTrack);
        // console.log("outer len", outerTrack.length)

        return this.outerTrack;
    }

    findOuterPtFromInner(innerPt:number[], prevPrevTile:number, prevInnerTile:number, innerTile:number, nextInnerTile:number) {
        let tempPt:number[];
        let tileToPlace:number;

        // if inner tile is a diagonal tile
        if (terrainArray.diagonals.includes(innerTile)) {
            if (innerTile == terrainArray.diag_NW) {
                tempPt = [innerPt[0] + 1, innerPt[1] + 1];
                tileToPlace = terrainArray.corner_SE;
            }
            else if (innerTile == terrainArray.diag_NE) {
                tempPt = [innerPt[0] + 1, innerPt[1] - 1];
                tileToPlace = terrainArray.corner_SW;
            }
            else if (innerTile == terrainArray.diag_SE) {
                // if (this.isClockwise && prevPrevTile == terrainArray.diag_SW) {
                //     tileToPlace = terrainArray.straight_up;
                // }
                tempPt = [innerPt[0] - 1, innerPt[1] - 1];
                tileToPlace = terrainArray.corner_NW;
            }
            else if (innerTile == terrainArray.diag_SW) {
                // if (!this.isClockwise && prevPrevTile == terrainArray.diag_SE) {
                //     tileToPlace = terrainArray.straight_up;
                // }
                tempPt = [innerPt[0] - 1, innerPt[1] + 1];
                tileToPlace = terrainArray.corner_NE;
            }
        }

        // if inner tile is a corner tile
        else if (terrainArray.corners.includes(innerTile)) {
            if (innerTile == terrainArray.corner_NW) {
                tempPt = [innerPt[0] + 1, innerPt[1] + 1];
                tileToPlace = terrainArray.diag_SE;
            }
            else if (innerTile == terrainArray.corner_NE) {
                tempPt = [innerPt[0] + 1, innerPt[1] - 1];
                tileToPlace = terrainArray.diag_SW;
            }
            else if (innerTile == terrainArray.corner_SE) {
                tempPt = [innerPt[0] - 1, innerPt[1] - 1];
                tileToPlace = terrainArray.diag_NW;
            }
            else if (innerTile == terrainArray.corner_SW) {
                tempPt = [innerPt[0] - 1, innerPt[1] + 1];
                tileToPlace = terrainArray.diag_NE;
            }
        }

        // if inner tiles is a straight or start/finish tile
        else if (terrainArray.straights.includes(innerTile) || terrainArray.finishes.includes(innerTile)) {
            if (innerTile == terrainArray.straight_up || innerTile == terrainArray.finish_up) {
                tempPt = [innerPt[0] + 1, innerPt[1]];

                if (prevInnerTile == terrainArray.diag_NW) {
                    tileToPlace = terrainArray.corner_SE;
                } 
                else {
                    tileToPlace = (innerTile == terrainArray.straight_up) ? terrainArray.straight_down : terrainArray.finish_down;
                }
            }
            else if (innerTile == terrainArray.straight_down || innerTile == terrainArray.finish_down) {
                tempPt = [innerPt[0] - 1, innerPt[1]];

                if (prevInnerTile == terrainArray.diag_SE) {
                    tileToPlace = terrainArray.corner_NW;
                } 
                else {
                    tileToPlace =  (innerTile == terrainArray.straight_down) ? terrainArray.straight_up : terrainArray.finish_up;
                }
            }
            else if (innerTile == terrainArray.straight_left || innerTile == terrainArray.finish_left) {
                tempPt = [innerPt[0], innerPt[1] + 1];

                if (prevInnerTile == terrainArray.diag_SW) {
                    tileToPlace = terrainArray.corner_NE;
                } 
                else {
                    tileToPlace = (innerTile == terrainArray.straight_left) ? terrainArray.straight_right : terrainArray.finish_right;
                }
            }
            else if (innerTile == terrainArray.straight_right || innerTile == terrainArray.finish_right) {
                tempPt = [innerPt[0], innerPt[1] - 1];
                if (prevInnerTile == terrainArray.diag_NE) {
                    tileToPlace = terrainArray.corner_SW;
                } 
                else {
                    tileToPlace =  (innerTile == terrainArray.straight_right) ? terrainArray.straight_left : terrainArray.finish_left;
                }
            }
        }


        // change this.mapArray[][] = terrainArray.tile to tileToPlace = terrainArray.tile
        // then add code below to end of if statements
        if (tempPt != null) {
            if (terrainArray.all_roads.includes(this.mapArray[tempPt[0]][tempPt[1]])) {
                tileToPlace = terrainArray.blank_road;
                console.log("dup: ", tempPt)
            }
            this.mapArray[tempPt[0]][tempPt[1]] = tileToPlace;
        }

        
        return tempPt;
    }

    fillOuterMissingPoints() {
        let currPt:number[];
        let currTile:number;
        let nextPt:number[];
        let nextTile:number;
        let btwnPt:number[];
        let btwnTile:number;
        let diff:number;

        for (let i = 0; i < this.outerTrack.length - 1; i++) {
            console.log(this.outerTrack.length)
            currPt = this.outerTrack[i];
            currTile = this.mapArray[currPt[0]][currPt[1]];
            nextPt = this.outerTrack[i + 1];
            nextTile = this.mapArray[nextPt[0]][nextPt[1]];

            if (i > 250) {
                continue;
            }

            // difference between coordinates of two consecutive points
            diff = Math.abs(currPt[0] - nextPt[0]) + Math.abs(currPt[1] - nextPt[1]);

            if (diff > 2) {
                console.log("Looooooong")
                console.log("i", i)
                console.log('curr', currPt)
                console.log('next', nextPt)
                // console.log('diff', diff)

                if (this.isClockwise) {
                    if (currTile == terrainArray.diag_NW || currTile == terrainArray.corner_NE || currTile == terrainArray.straight_up) {
                        btwnTile = terrainArray.straight_up;
                        btwnPt = [currPt[0], currPt[1] + 1];
                    }
                    else if (currTile == terrainArray.diag_SE || currTile == terrainArray.corner_SW || currTile == terrainArray.straight_down) {
                        btwnTile = terrainArray.straight_down;
                        btwnPt = [currPt[0], currPt[1] - 1];
                    }
                    else if (currTile == terrainArray.diag_SW || currTile == terrainArray.corner_NW || currTile == terrainArray.straight_left) {
                        btwnTile = terrainArray.straight_left;
                        btwnPt = [currPt[0] - 1, currPt[1]];
                    }
                    else if (currTile == terrainArray.diag_NE || currTile == terrainArray.corner_SE || currTile == terrainArray.straight_right) {
                        btwnTile = terrainArray.straight_right;
                        btwnPt = [currPt[0] + 1, currPt[1]];
                    }

                } else { // if counter clockwise
                    if (currTile == terrainArray.diag_NE || currTile == terrainArray.corner_NW || currTile == terrainArray.straight_up) {
                        btwnTile = terrainArray.straight_up;
                        btwnPt = [currPt[0], currPt[1] - 1];
                    }
                    else if (currTile == terrainArray.diag_SW || currTile == terrainArray.corner_SE || currTile == terrainArray.straight_down) {
                        btwnTile = terrainArray.straight_down;
                        btwnPt = [currPt[0], currPt[1] + 1];
                    }
                    else if (currTile == terrainArray.diag_NW || currTile == terrainArray.corner_SW || currTile == terrainArray.straight_left) {
                        btwnTile = terrainArray.straight_left;
                        btwnPt = [currPt[0] + 1, currPt[1]];
                    }
                    else if (currTile == terrainArray.diag_SE || currTile == terrainArray.corner_NE || currTile == terrainArray.straight_right) {
                        btwnTile = terrainArray.straight_right;
                        btwnPt = [currPt[0] - 1, currPt[1]];
                    }
                }

                if (btwnPt  != null) {
                    this.outerTrack.splice(i + 1, 0, btwnPt);
                    this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
                }
                
                console.log("len", this.outerTrack.length)
            }

            if (diff == 2) {    // ie if points are not next to each other
                console.log("i", i)
                console.log('curr', currPt, currTile)
                console.log('next', nextPt, nextTile)
                // console.log('diff', diff)
                // if currPt is a diagonal tile
                if (terrainArray.diagonals.includes(currTile)) {
                    console.log('diag')
                    if (currTile == terrainArray.diag_NW) {
                        console.log('nw')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_NE : terrainArray.straight_up;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SW : terrainArray.straight_left;
                        }
                        // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_left : terrainArray.straight_up;
                        btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] + 1, currPt[1]] : [currPt[0], currPt[1] + 1];
                    }
                    else if (currTile == terrainArray.diag_NE) {
                        console.log('ne')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_up;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SE : terrainArray.straight_right;
                        }
                        // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_right : terrainArray.straight_up;
                        btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] + 1, currPt[1]] : [currPt[0], currPt[1] - 1];
                    }
                    else if (currTile == terrainArray.diag_SE) {
                        console.log('se')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_SE || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_down;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_SE || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NE : terrainArray.straight_right;
                        }
                        // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_right : terrainArray.straight_down;
                        btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] - 1, currPt[1]] : [currPt[0], currPt[1] - 1];
                    }
                    else if (currTile == terrainArray.diag_SW) {
                        console.log('sw')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_SW || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SE : terrainArray.straight_down;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_SW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NE : terrainArray.straight_left;
                        }
                        // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_left : terrainArray.straight_down;
                        btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] - 1, currPt[1]] : [currPt[0], currPt[1] + 1];
                    }
                }

                //if currPt is a corner tile
                else if (terrainArray.corners.includes(currTile)) {
                    console.log('corner')
                    if (currTile == terrainArray.corner_NW) {
                        console.log('nw')
                        if (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_SE || nextTile == terrainArray.diag_SW) {
                            btwnTile = terrainArray.diag_NW;
                        } 
                        else {
                            btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_left;
                        }
                        // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_left;
                        btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] - 1] : [currPt[0] - 1, currPt[1]];
                    }
                    else if (currTile == terrainArray.corner_NE) {
                        console.log('ne')
                        // if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.diag_SW) {
                        //     btwnTile = terrainArray.diag_NW;
                        // } 
                        if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SE || nextTile == terrainArray.diag_SW) {
                            btwnTile = terrainArray.diag_NE;
                        } 
                        else {
                            btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_right;
                        }
                        // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_right;
                        btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] + 1] : [currPt[0] - 1, currPt[1]];
                    }
                    else if (currTile == terrainArray.corner_SE) {
                        console.log('se')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW) ? terrainArray.diag_NW : terrainArray.straight_down;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_right;
                        }
                        // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_down : terrainArray.straight_right;
                        btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] + 1] : [currPt[0] + 1, currPt[1]];
                    }
                    else if (currTile == terrainArray.corner_SW) {
                        console.log('sw')
                        if (currPt[0] == nextPt[0]) {
                            btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NE : terrainArray.straight_down;
                        } 
                        else {
                            btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_left;
                        }
                        // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_down : terrainArray.straight_left;
                        btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] - 1] : [currPt[0] + 1, currPt[1]];
                    }
                }

                // if currPt is a straight tile
                else if (terrainArray.straights.includes(currTile)) {
                    console.log('straight')
                    if (currTile == terrainArray.straight_up) {
                        console.log('up')
                        if (currPt[0] == nextPt[0]) {
                            if (currPt[1] < nextPt[1]) {
                                btwnTile = (nextTile == terrainArray.diag_NW) ? terrainArray.diag_NE : terrainArray.straight_up;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_NE) ? terrainArray.diag_NW : terrainArray.straight_up;
                            }
                            btwnPt = (currPt[1] < nextPt[1]) ? [currPt[0], currPt[1] + 1] : [currPt[0], currPt[1] - 1];
                        }
                        else if (currPt[1] == nextPt[1]) {
                            if (currPt[0] > nextPt[0]) {
                                if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.straight_left) {
                                    btwnTile = terrainArray.diag_SW;
                                }
                                else if (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_SE || nextTile == terrainArray.straight_right) {
                                    btwnTile = terrainArray.diag_SE;
                                }
                                btwnPt = [currPt[0] - 1, currPt[1]];
                            }
                        }
                        else {
                            if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
                                btwnTile = terrainArray.diag_NW;
                                btwnPt = [currPt[0], currPt[1] - 1];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
                                btwnTile = terrainArray.diag_NE;
                                btwnPt = [currPt[0], currPt[1] + 1];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
                                btwnTile = terrainArray.corner_NE;
                                btwnPt = [currPt[0], currPt[1] - 1];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SW
                                btwnTile = terrainArray.corner_NW;
                                btwnPt = [currPt[0], currPt[1] + 1];
                            }
                        }

                    }
                    else if (currTile == terrainArray.straight_down) {
                        console.log('down')
                        if (currPt[0] == nextPt[0]) {
                            if (currPt[1] < nextPt[1]) {
                                btwnTile = (nextTile == terrainArray.diag_SW) ? terrainArray.diag_SE : terrainArray.straight_down;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_SE) ? terrainArray.diag_SW : terrainArray.straight_down;
                            }
                            btwnPt = (currPt[1] < nextPt[1]) ? [currPt[0], currPt[1] + 1] : [currPt[0], currPt[1] - 1];
                        }
                        else if (currPt[1] == nextPt[1]) {
                            if (currPt[0] < nextPt[0]) {
                                if (nextTile == terrainArray.diag_SW  || nextTile == terrainArray.corner_NW || nextTile == terrainArray.straight_left) { 
                                    btwnTile = terrainArray.diag_NW;
                                }
                                else if (nextTile == terrainArray.diag_SE  || nextTile == terrainArray.corner_NE || nextTile == terrainArray.straight_right) { 
                                    btwnTile = terrainArray.diag_NE;
                                }
                                btwnPt = [currPt[0] + 1, currPt[1]];
                            }
                        }
                        else {
                            if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
                                btwnTile = terrainArray.corner_SW;
                                btwnPt = [currPt[0], currPt[1] + 1];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
                                btwnTile = terrainArray.corner_SE;
                                btwnPt = [currPt[0], currPt[1] - 1];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SE
                                btwnTile = terrainArray.diag_SE;
                                btwnPt = [currPt[0], currPt[1] + 1];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SW
                                btwnTile = terrainArray.diag_SW;
                                btwnPt = [currPt[0], currPt[1] - 1];
                            }
                        }

                    }
                    else if (currTile == terrainArray.straight_left) {
                        console.log('left')
                        if (currPt[1] == nextPt[1]) {
                            if (currPt[0] < nextPt[0]) {
                                btwnTile = (nextTile == terrainArray.diag_NW) ? terrainArray.diag_SW : terrainArray.straight_left;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_SW) ? terrainArray.diag_NW : terrainArray.straight_left;
                            }
                            btwnPt = (currPt[0] < nextPt[0]) ? [currPt[0] + 1, currPt[1]] : [currPt[0] - 1, currPt[1]];
                        }
                        else if (currPt[0] == nextPt[0]) {
                            if (currPt[1] > nextPt[1]) {
                                if (nextTile == terrainArray.diag_SW || nextTile == terrainArray.diag_SE || nextTile == terrainArray.straight_down) {
                                    btwnTile = terrainArray.diag_SE;
                                }
                                else if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.diag_NE || nextTile == terrainArray.straight_up) {
                                    btwnTile = terrainArray.diag_NE;
                                }
                                btwnPt = [currPt[0], currPt[1] - 1];
                            }
                        }
                        else {
                            if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_NW
                                btwnTile = terrainArray.diag_NW;
                                btwnPt = [currPt[0] - 1, currPt[1]];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
                                btwnTile = terrainArray.corner_NW;
                                btwnPt = [currPt[0] + 1, currPt[1]];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
                                btwnTile = terrainArray.corner_SW;
                                btwnPt = [currPt[0] - 1, currPt[1]];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SW
                                btwnTile = terrainArray.diag_SW;
                                btwnPt = [currPt[0] + 1, currPt[1]];
                            }
                        }

                    }
                    else if (currTile == terrainArray.straight_right) {
                        console.log('right')
                        if (currPt[1] == nextPt[1]) {
                            if (currPt[0] < nextPt[0]) {
                                btwnTile = (nextTile == terrainArray.diag_NE) ? terrainArray.diag_SE : terrainArray.straight_right;
                            }
                            else { // this else!!!!!!!!!
                                // btwnTile = (nextTile == terrainArray.diag_NE ||  terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_right;
                                btwnTile = (nextTile == terrainArray.diag_SE) ? terrainArray.diag_NE : terrainArray.straight_right;
                            }
                            btwnPt = (currPt[0] < nextPt[0]) ? [currPt[0] + 1, currPt[1]] : [currPt[0] - 1, currPt[1]];
                        }
                        else if (currPt[0] == nextPt[0]) {
                            if (currPt[1] < nextPt[1]) {
                                if (nextTile == terrainArray.diag_SE || nextTile == terrainArray.corner_SW || nextTile == terrainArray.straight_down) {
                                    btwnTile = terrainArray.diag_SW;
                                }
                                else if (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW || nextTile == terrainArray.straight_up) {
                                    btwnTile = terrainArray.diag_NW;
                                    btwnPt = [currPt[0], currPt[1] + 1];
                                }
                            } 
                        } 
                        else {
                            if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
                                btwnTile = terrainArray.corner_NE;
                                btwnPt = [currPt[0] + 1, currPt[1]];
                            }
                            else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
                                btwnTile = terrainArray.diag_NE;
                                btwnPt = [currPt[0] - 1, currPt[1]];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
                                btwnTile = terrainArray.diag_SE;
                                btwnPt = [currPt[0] + 1, currPt[1]];
                            }
                            else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SW
                                btwnTile = terrainArray.corner_SE;
                                btwnPt = [currPt[0] - 1, currPt[1]];
                            }
                        }
                    }
                }
                if (btwnPt  != null) {
                    this.outerTrack.splice(i + 1, 0, btwnPt);
                    this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
                }
                
                // this.outerTrack.splice(i + 1, 0, btwnPt);
                // this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
                // console.log("len", this.outerTrack.length)
            }

            // if (btwnPt  != null) {
            //     this.outerTrack.splice(i + 1, 0, btwnPt);
            //     this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
            // }
        }
        // console.log('outer')
    }
}