import type ConfigData from "./ConfigData.js"
import terrainArray from "./TerrainArray.js"
import PlaceTrackTiles from "./PlaceTrackTiles.js"
import GeneratePoints from "./GeneratePoints.js"
// works in node, not on browser
import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"

export default class TrackGeneration {
    mapArray:number[][];
    firstPt:number[];
    startIndex:number;
    startLine:number[];
    startTile:number;
    playerStartPt:number[];
    innerTrack:number[][];
    outerTrack:number[][];
    isClockwise:boolean;
    placeTrackTiles:PlaceTrackTiles;
    generatePoints:GeneratePoints;

    // constants for generating track
    numPts:number;

    mapHeight:number;
    mapWidth:number;
    margin:number;
    borderWidth:number; // y
    borderHeight:number; // x

    concavityVal:number;

    convexityDifficulty:number;
    convexityDisp:number;

    trackAngle:number;

    splineAlpha:number;
    splinePtsBtHull:number;
    minTrackLength:number;
    maxTrackLength:number;

    constructor(mapConfigData:ConfigData) {
        this.mapArray = [];
        this.firstPt = [];

        this.numPts = 30;

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.2;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);

        this.concavityVal = 50;   // from 1 to inf, closer to 1: hugs shape more

        this.convexityDifficulty = 0.5;
        this.convexityDisp = 10; //the closer the value is to 0, the harder the track should be 

        this.trackAngle = 95; // in degrees

        this.splineAlpha = 0.75; // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        this.splinePtsBtHull = 2;

        this.minTrackLength = 10;
        this.maxTrackLength = 250;

        this.generatePoints = new GeneratePoints(this.numPts, this.margin, this.concavityVal, this.convexityDifficulty, this.convexityDisp, this.trackAngle, this.splineAlpha, this.splinePtsBtHull, this.minTrackLength, this.maxTrackLength, mapConfigData);
    }

    createMapArray() {
        // creating mapArray matrix
        let points:number[][] = this.generatePoints.generateRandomPoints();
        let convexHull:number[][] = this.generatePoints.findConvexHull(points);

        // this.findIfClockwiseTrack(convexHull);

        let numPtMoves:number = 3;
        let distVal:number = 10;
        for(let i = 0; i < numPtMoves; i++) {  
            convexHull = this.generatePoints.movePtsApart(convexHull, distVal);  
        } 

        //push apart again, so we can stabilize the points distances. 
        let adjustedConvexPts:number[][] = this.generatePoints.adjustConvexity(convexHull);

        numPtMoves = 3;
        distVal = 5;
        for(let i = 0; i < numPtMoves; i++) {  
            adjustedConvexPts = this.generatePoints.movePtsApart(adjustedConvexPts, distVal);  
        } 

        let fixedAnglePts:number[][] = adjustedConvexPts;

        numPtMoves = 1;
        for(let i = 0; i < numPtMoves; i++) {
            fixedAnglePts = this.generatePoints.fixTrackAngles(fixedAnglePts); 
            
            // adjustedPts = this.movePtsApart(adjustedPts);  
        }  

        let splinePts:number[][] = this.generatePoints.findSpline(fixedAnglePts);

        let trackCoordinates:number[][] = this.generatePoints.fillInTrack(splinePts);
        console.log("track length: ", trackCoordinates.length);

        // let numNeighbors:number = this.removeSnaking(trackCoordinates);
        // console.log("# neighbors: ", numNeighbors);

        // let loop:number[][] = this.fillInLoop(fixedAnglePts);

        if (trackCoordinates.length < this.minTrackLength || trackCoordinates.length > this.maxTrackLength) {
            this.mapArray = [];
            // this.firstPt = [];
            // this.startPt = [];
            this.innerTrack = [];
            // clockwiseTrack;
            this.createMapArray();
        } else {
            this.firstPt = trackCoordinates[0];
            this.innerTrack = trackCoordinates;
            this.isClockwise = this.generatePoints.findIfClockwiseTrack(trackCoordinates);
            this.startIndex = this.generatePoints.findStartIndex(trackCoordinates);
            this.startLine = this.generatePoints.findStartLineCoord(trackCoordinates);
            this.startTile = this.generatePoints.findStartTile(trackCoordinates);
            this.playerStartPt = this.generatePoints.findPlayerStart(trackCoordinates);

            console.log("1st pt: ", this.firstPt);

            // fill in mapArray with grass tiles, then inner track with road tiles
            this.placeTrackTiles = new PlaceTrackTiles(this.mapArray, trackCoordinates, this.mapHeight, this.mapWidth, this.isClockwise, this.startIndex, this.startTile);
            // this.placeTrackTiles.fillGrassTiles();
            // this.placeTrackTiles.placeTiles(this.startIndex, this.startTile);
            
            // // finding outer track, then filling mapArray with road tiles
            // this.outerTrack = this.placeTrackTiles.findOuterTrack();
            // this.placeTrackTiles.fillOuterMissingPoints();

            this.mapArray = this.placeTrackTiles.fillTrackTiles();
        }
        // for (let i = 0; i < trackCoordinates.length; i++) {
        //         console.log("(", this.outerTrack[i][0], ", ", this.outerTrack[i][1], ")  --> ", i);
        // } 
    }

    // fillGrassTiles(trackCoordinates:number[][]) {
    //     for (let i = 0; i < this.mapHeight; i++) {
    //         let temp:number[] = [];
    //         for (let j = 0; j < this.mapWidth; j++) {
    //             if (i == 0 && (j != 0 && j != this.mapWidth - 1)) {
    //                 temp.push(terrainArray.grass_up);
    //             }
                
    //              else if (i == this.mapHeight - 1 && (j != 0 && j != this.mapWidth - 1)) {
    //                 temp.push(terrainArray.grass_down);
    //             } else {

    //                 if (j == 0) {
    //                     if (i == 0) {
    //                         temp.push(terrainArray.grass_NW);
    //                     } else if (i == this.mapHeight - 1) {
    //                         temp.push(terrainArray.grass_SW);
    //                     } else {
    //                         temp.push(terrainArray.grass_left);
    //                     }
    //                 } else if (j == this.mapWidth - 1) {
    //                     if (i == 0) {
    //                         temp.push(terrainArray.grass_NE);
    //                     } else if (i == this.mapHeight - 1) {
    //                         temp.push(terrainArray.grass_SE);
    //                     } else {
    //                         temp.push(terrainArray.grass_right);
    //                     }
    //                 } else {
    //                 temp.push(terrainArray.grass); 
    //                 }  
    //             }              
    //         }
    //         this.mapArray.push(temp)
    //     }

    //     return this.mapArray;
    // }

    // placeTiles(trackCoordinates:number[][]) {
    //     let finish_placed:boolean = false;
    //     let prev:number[];
    //     let curr:number[];
    //     let next:number[];
    //     let prevprev:number[];
    //     let nextnext:number[];

    //     for (let i = 1; i < trackCoordinates.length; i++) {
    //         prevprev = (i == 1) ? trackCoordinates[trackCoordinates.length - 2] : trackCoordinates[i - 2];
    //         prev = trackCoordinates[i - 1];
    //         curr = trackCoordinates[i];
    //         next = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 1] : trackCoordinates[1];

    //         if (i < trackCoordinates.length - 2) {
    //             nextnext = trackCoordinates[i + 2];
    //         } else if (i == trackCoordinates.length - 2) {
    //             nextnext = trackCoordinates[1];
    //         } else {
    //             nextnext = trackCoordinates[2];
    //         }
    //         // nextnext = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 2] : trackCoordinates[2];

    //         // if (i < trackCoordinates.length - 1) {
    //         //     nextnext = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 2] : trackCoordinates[2];
    //         // }
    //         if (finish_placed == false && i > 1) {
    //             if (prevprev[0] < prev[0] && prev[0] < curr[0] && curr[0] < next[0] && next[0] < nextnext[0]) {
    //                 this.mapArray[curr[0]][curr[1]] = terrainArray.finish_right;
    //                 finish_placed = true;

    //             } else if (prevprev[0] > prev[0] && prev[0] > curr[0] && curr[0] > next[0] && next[0] > nextnext[0]) {
    //                 this.mapArray[curr[0]][curr[1]] = terrainArray.finish_left;
    //                 finish_placed = true;

    //             } else if (prevprev[1] < prev[1] && prev[1] < curr[1] && curr[1] < next[1] && next[1] < nextnext[1]) {
    //                 this.mapArray[curr[0]][curr[1]] = terrainArray.finish_up;
    //                 finish_placed = true;

    //             } else if (prevprev[1] > prev[1] && prev[1] > curr[1] && curr[1] > next[1] && next[1] > nextnext[1]) {
    //                 this.mapArray[curr[0]][curr[1]] = terrainArray.finish_down;
    //                 finish_placed = true;

    //             } else {
    //                 this.placeInnerTiles(prevprev, prev, curr, next, nextnext);
    //             }

    //             if (finish_placed == true) {
    //                 this.startLine = trackCoordinates[i];
    //                 if (this.isClockwise) {
    //                     this.playerStartPt = trackCoordinates[i + 1];
    //                     console.log("clockwise")
    //                 } else {
    //                     this.playerStartPt = trackCoordinates[i - 1];
    //                     console.log("counter clockwise")                    
    //                 }
    //                 console.log("start line: ", i);  
    //                 // console.log("prevprev", prevprev);
    //                 // console.log("prev", prev);
    //                 // console.log("curr", curr);
    //                 // console.log("next", next);
    //                 // console.log("nextnext", nextnext);
    //             }

    //         } else {
    //             this.placeInnerTiles(prevprev, prev, curr, next, nextnext);
    //         }
            
    //         prevprev = prev;
    //         prev = curr;
    //     }

    //     // replace i = 1 tile 
    //     this.placeInnerTiles(trackCoordinates[trackCoordinates.length - 2], trackCoordinates[0], trackCoordinates[1], trackCoordinates[2], trackCoordinates[3]);

    // }

    // placeInnerTiles(prevprev: number[], prev:number[], curr:number[], next:number[], nextnext:number[]) {
    //     let prev_array:number[] = [];

    //     // filling straight tiles
    //     if (prev[1] < curr[1] && curr[1] < next[1]) {
    //         this.mapArray[curr[0]][curr[1]] = terrainArray.straight_up;
    //     } 
    //     else if (prev[1] > curr[1] && curr[1] > next[1]) {
    //         this.mapArray[curr[0]][curr[1]] = terrainArray.straight_down;
    //     } 
    //     else if (prev[0] > curr[0] && curr[0] > next[0]) {
    //         this.mapArray[curr[0]][curr[1]] = terrainArray.straight_left;
    //     } 
    //     else if (prev[0] < curr[0] && curr[0] < next[0]) {
    //         this.mapArray[curr[0]][curr[1]] = terrainArray.straight_right;
    //     }

    //     // filling diagonal/corner tiles
    //     else if ((prev[1] < curr[1] && curr[0] > next[0]) || (prev[0] < curr[0] && curr[1] > next[1])) {
    //         prev_array = [terrainArray.straight_left, terrainArray.straight_up, terrainArray.corner_NE, terrainArray.corner_SW, terrainArray.diag_NW];

    //         if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.corner_NW;
    //         } else {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.diag_SE;
    //         }
    //     }
    //     else if ((prev[0] < curr[0] && curr[1] < next[1]) || (prev[1] > curr[1] && curr[0] > next[0])) {
    //         prev_array = [terrainArray.straight_right, terrainArray.straight_up, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_NE];

    //         if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.corner_NE;
    //         } else {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.diag_SW;
    //         }        
    //     }
    //     else if ((prev[1] > curr[1] && curr[0] < next[0]) || (prev[0] > curr[0] && curr[1] < next[1])) {
    //         prev_array = [terrainArray.straight_down, terrainArray.straight_right, terrainArray.corner_SW, terrainArray.corner_NE, terrainArray.diag_SE];

    //         if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.corner_SE;
    //         } else {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NW;
    //         }        
    //     }
    //     else if ((prev[0] > curr[0] && curr[1] > next[1]) || (prev[1] < curr[1] && curr[0] < next[0])) {
    //         prev_array = [terrainArray.straight_down, terrainArray.straight_left, terrainArray.corner_NW, terrainArray.corner_SE, terrainArray.diag_SW];

    //         if (prev_array.includes(this.mapArray[prev[0]][prev[1]])) {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.corner_SW;
    //         } else {
    //             this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NE;
    //         }        
    //     }
    // }

    // findOuterTrack(trackCoordinates:number[][]) {
    //     let outerTrack:number[][] = [];
    //     let outerPt:number[] = [];

    //     let currPt:number[];
    //     let currInnerTile:number;
    //     let prevPt:number[];
    //     let prevInnerTile:number;
    //     let nextPt:number[];
    //     let nextInnerTile:number;
        
    //     // setting prevPt and firstInnerTile for first pt in trackCoordinates
    //     currPt = trackCoordinates[0];
    //     currInnerTile = this.mapArray[currPt[0]][currPt[1]];
    //     prevPt = trackCoordinates[trackCoordinates.length - 2];
    //     prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];
    //     nextPt = trackCoordinates[1];
    //     nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

    //     // setting first pt in outerTrack and the tile for the first outer pt in mapArray
    //     outerTrack.push(this.findOuterPt(currPt, currInnerTile, prevInnerTile, nextInnerTile));
    //     // outerTrack[0] = outerPt;
    //     console.log("1st outer pt: ", outerTrack[0]);

    //     for (let i = 1; i < trackCoordinates.length - 1; i++) {
    //         currPt = trackCoordinates[i];
    //         currInnerTile = this.mapArray[currPt[0]][currPt[1]];

    //         prevPt = trackCoordinates[i - 1];
    //         prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];

    //         nextPt = trackCoordinates[i + 1];
    //         nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

    //         outerTrack.push(this.findOuterPt(currPt, currInnerTile, prevInnerTile, nextInnerTile));
    //     }

    //     // adding first pt to the end of outerTrack array to complete the loop
    //     outerTrack.push(outerTrack[0]);
    //     console.log("outer len", outerTrack.length)
    //     // let tempTrack:number[][] = this.fillInTrack(outerTrack);
    //     // console.log("o len", tempTrack.length)
    //     // for (let i = 0; i < trackCoordinates.length; i++) {
    //     //         console.log("(", outerPt[i][0], ", ", outerPt[i][1], ")  --> ", i);
    //     // } 

    //     // this.fillOuterMissingPoints(outerTrack);
    //     // console.log("outer len", outerTrack.length)

    //     return outerTrack;
    // }

    // findOuterPt(innerPt:number[], innerTile:number, prevInnerTile:number, nextInnerTile:number) {
    //     let tempPt:number[] = [];

    //     if (terrainArray.diagonals.includes(innerTile)) {
    //         if (innerTile == terrainArray.diag_NW) {
    //             tempPt = [innerPt[0] + 1, innerPt[1] + 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SE;
    //             // console.log("corner_SE");

    //         }
    //         else if (innerTile == terrainArray.diag_NE) {
    //             tempPt = [innerPt[0] + 1, innerPt[1] - 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SW;
    //             // console.log("corner_SW");

    //         }
    //         else if (innerTile == terrainArray.diag_SE) {
    //             tempPt = [innerPt[0] - 1, innerPt[1] - 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NW;
    //             // console.log("corner_NW");

    //         }
    //         else if (innerTile == terrainArray.diag_SW) {
    //             tempPt = [innerPt[0] - 1, innerPt[1] + 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NE;
    //             // console.log("corner_NE");

    //         }
    //     }
    //     else if (terrainArray.corners.includes(innerTile)) {
    //         if (innerTile == terrainArray.corner_NW) {
    //             tempPt = [innerPt[0] + 1, innerPt[1] + 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_SE;
    //             // console.log("diag_SE");

    //         }
    //         else if (innerTile == terrainArray.corner_NE) {
    //             tempPt = [innerPt[0] + 1, innerPt[1] - 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_SW;
    //             // console.log("diag_SW");

    //         }
    //         else if (innerTile == terrainArray.corner_SE) {
    //             tempPt = [innerPt[0] - 1, innerPt[1] - 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_NW;
    //             // console.log("diag_NW");

    //         }
    //         else if (innerTile == terrainArray.corner_SW) {
    //             tempPt = [innerPt[0] - 1, innerPt[1] + 1];
    //             this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_NE;
    //             // console.log("diag_NE");

    //         }
    //     }
    //     else if (terrainArray.straights.includes(innerTile) || terrainArray.finishes.includes(innerTile)) {
    //         if (innerTile == terrainArray.straight_up || innerTile == terrainArray.finish_up) {
    //             tempPt = [innerPt[0] + 1, innerPt[1]];

    //             if (prevInnerTile == terrainArray.diag_NW) {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SE;
    //                 // console.log("corner_SE");
    //             } 
    //             else {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = (innerTile == terrainArray.straight_up) ? terrainArray.straight_down : terrainArray.finish_down;
    //                 // console.log("down");
    //             }

    //         }
    //         else if (innerTile == terrainArray.straight_down || innerTile == terrainArray.finish_down) {
    //             tempPt = [innerPt[0] - 1, innerPt[1]];

    //             if (prevInnerTile == terrainArray.diag_SE) {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NW;
    //                 // console.log("corner_NW");
    //             } 
    //             else {
    //                 this.mapArray[tempPt[0]][tempPt[1]] =  (innerTile == terrainArray.straight_down) ? terrainArray.straight_up : terrainArray.finish_up;
    //                 // console.log("up");
    //             }

    //         }
    //         else if (innerTile == terrainArray.straight_left || innerTile == terrainArray.finish_left) {
    //             tempPt = [innerPt[0], innerPt[1] + 1];

    //             if (prevInnerTile == terrainArray.diag_SW) {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NE;
    //                 // console.log("corner_NE");

    //             } 
    //             else {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = (innerTile == terrainArray.straight_left) ? terrainArray.straight_right : terrainArray.finish_right;
    //                 // console.log("right");
    //             }

    //         }
    //         else if (innerTile == terrainArray.straight_right || innerTile == terrainArray.finish_right) {
    //             tempPt = [innerPt[0], innerPt[1] - 1];

    //             // if (!terrainArray.diagonals.includes(prevTile)) {
    //             if (prevInnerTile == terrainArray.diag_NE) {
    //                 this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SW;
    //                 // console.log("corner_SW");
    //             } 
    //             else {
    //                 this.mapArray[tempPt[0]][tempPt[1]] =  (innerTile == terrainArray.straight_right) ? terrainArray.straight_left : terrainArray.finish_left;
    //                 // console.log("left");   
    //             }
    //         }
    //     }

    //     // outerTrack.push(tempPt);
    //     return tempPt;
    // }

    // fillOuterMissingPoints(outerTrack:number[][]) {
    //     let currPt:number[];
    //     let currTile:number;
    //     let nextPt:number[];
    //     let nextTile:number;
    //     let btwnPt:number[];
    //     let btwnTile:number;
    //     let diff:number;

    //     console.log('outer')

    //     for (let i = 0; i < outerTrack.length - 1; i++) {
    //         currPt = outerTrack[i];
    //         currTile = this.mapArray[currPt[0]][currPt[1]];
    //         nextPt = outerTrack[i + 1];
    //         nextTile = this.mapArray[nextPt[0]][nextPt[1]];

    //         if (i > outerTrack.length - 1) {
    //             continue;
    //         }

    //         // difference between coordinates of two consecutive points
    //         diff = Math.abs(currPt[0] - nextPt[0]) + Math.abs(currPt[1] - nextPt[1]);

    //         if (diff > 2) {
    //             console.log("Looooooong")
    //             console.log("i", i)
    //             console.log('curr', currPt)
    //             console.log('next', nextPt)
    //             console.log('diff', diff)

    //             if (this.isClockwise) {
    //                 if (currTile == terrainArray.diag_NW || currTile == terrainArray.corner_NE || currTile == terrainArray.straight_up) {
    //                     btwnTile = terrainArray.straight_up;
    //                     btwnPt = [currPt[0], currPt[1] + 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_SE || currTile == terrainArray.corner_SW || currTile == terrainArray.straight_down) {
    //                     btwnTile = terrainArray.straight_down;
    //                     btwnPt = [currPt[0], currPt[1] - 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_SW || currTile == terrainArray.corner_NW || currTile == terrainArray.straight_left) {
    //                     btwnTile = terrainArray.straight_left;
    //                     btwnPt = [currPt[0] - 1, currPt[1]];
    //                 }
    //                 else if (currTile == terrainArray.diag_NE || currTile == terrainArray.corner_SE || currTile == terrainArray.straight_right) {
    //                     btwnTile = terrainArray.straight_right;
    //                     btwnPt = [currPt[0] + 1, currPt[1]];
    //                 }

    //             } else { // if couunter clockwise
    //                 if (currTile == terrainArray.diag_NE || currTile == terrainArray.corner_NW || currTile == terrainArray.straight_up) {
    //                     btwnTile = terrainArray.straight_up;
    //                     btwnPt = [currPt[0], currPt[1] - 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_SW || currTile == terrainArray.corner_SE || currTile == terrainArray.straight_down) {
    //                     btwnTile = terrainArray.straight_down;
    //                     btwnPt = [currPt[0], currPt[1] + 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_NW || currTile == terrainArray.corner_SW || currTile == terrainArray.straight_left) {
    //                     btwnTile = terrainArray.straight_left;
    //                     btwnPt = [currPt[0] + 1, currPt[1]];
    //                 }
    //                 else if (currTile == terrainArray.diag_SE || currTile == terrainArray.corner_NE || currTile == terrainArray.straight_right) {
    //                     btwnTile = terrainArray.straight_right;
    //                     btwnPt = [currPt[0] - 1, currPt[1]];
    //                 }
    //             }
    //             outerTrack.splice(i + 1, 0, btwnPt);
    //             this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
    //             console.log("len", outerTrack.length)
    //         }

    //         if (diff == 2) {    // ie if points are not next to each other
    //             console.log("i", i)
    //             console.log('curr', currPt, currTile)
    //             console.log('next', nextPt, nextTile)
    //             console.log('diff', diff)
    //             // if currPt is a diagonal tile
    //             if (terrainArray.diagonals.includes(currTile)) {
    //                 console.log('diag')
    //                 if (currTile == terrainArray.diag_NW) {
    //                     console.log('nw')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_NE : terrainArray.straight_up;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SW : terrainArray.straight_left;
    //                     }
    //                     // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_left : terrainArray.straight_up;
    //                     btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] + 1, currPt[1]] : [currPt[0], currPt[1] + 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_NE) {
    //                     console.log('ne')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_up;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SE : terrainArray.straight_right;
    //                     }
    //                     // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_right : terrainArray.straight_up;
    //                     btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] + 1, currPt[1]] : [currPt[0], currPt[1] - 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_SE) {
    //                     console.log('se')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_SE || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_down;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_SE || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NE : terrainArray.straight_right;
    //                     }
    //                     // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_right : terrainArray.straight_down;
    //                     btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] - 1, currPt[1]] : [currPt[0], currPt[1] - 1];
    //                 }
    //                 else if (currTile == terrainArray.diag_SW) {
    //                     console.log('sw')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_SW || nextTile == terrainArray.corner_NW || nextTile == terrainArray.corner_SE) ? terrainArray.diag_SE : terrainArray.straight_down;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_SW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NE : terrainArray.straight_left;
    //                     }
    //                     // btwnTile = (currPt[1] == nextPt[1]) ? terrainArray.straight_left : terrainArray.straight_down;
    //                     btwnPt = (currPt[1] == nextPt[1]) ? [currPt[0] - 1, currPt[1]] : [currPt[0], currPt[1] + 1];
    //                 }
    //             }

    //             //if currPt is a corner tile
    //             else if (terrainArray.corners.includes(currTile)) {
    //                 console.log('corner')
    //                 if (currTile == terrainArray.corner_NW) {
    //                     console.log('nw')
    //                     if (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_SE || nextTile == terrainArray.diag_SW) {
    //                         btwnTile = terrainArray.diag_NW;
    //                     } 
    //                     else {
    //                         btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_left;
    //                     }
    //                     // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_left;
    //                     btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] - 1] : [currPt[0] - 1, currPt[1]];
    //                 }
    //                 else if (currTile == terrainArray.corner_NE) {
    //                     console.log('ne')
    //                     if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.diag_SW) {
    //                         btwnTile = terrainArray.diag_NW;
    //                     } 
    //                     else {
    //                         btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_right;
    //                     }
    //                     // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_up : terrainArray.straight_right;
    //                     btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] + 1] : [currPt[0] - 1, currPt[1]];
    //                 }
    //                 else if (currTile == terrainArray.corner_SE) {
    //                     console.log('se')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW) ? terrainArray.diag_NW : terrainArray.straight_down;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_right;
    //                     }
    //                     // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_down : terrainArray.straight_right;
    //                     btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] + 1] : [currPt[0] + 1, currPt[1]];
    //                 }
    //                 else if (currTile == terrainArray.corner_SW) {
    //                     console.log('sw')
    //                     if (currPt[0] == nextPt[0]) {
    //                         btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NW : terrainArray.straight_down;
    //                     } 
    //                     else {
    //                         btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_left;
    //                     }
    //                     // btwnTile = (currPt[0] == nextPt[0]) ? terrainArray.straight_down : terrainArray.straight_left;
    //                     btwnPt = (currPt[0] == nextPt[0]) ? [currPt[0], currPt[1] - 1] : [currPt[0] + 1, currPt[1]];
    //                 }
    //             }

    //             // if currPt is a straight tile
    //             else if (terrainArray.straights.includes(currTile)) {
    //                 console.log('straight')
    //                 if (currTile == terrainArray.straight_up) {
    //                     console.log('up')
    //                     if (currPt[0] == nextPt[0]) {
    //                         if (currPt[1] < nextPt[1]) {
    //                             btwnTile = (nextTile == terrainArray.diag_NW ||  terrainArray.corner_SW) ? terrainArray.diag_NE : terrainArray.straight_up;
    //                         }
    //                         else {
    //                             btwnTile = (nextTile == terrainArray.diag_NE ||  terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_up;
    //                         }
    //                         btwnPt = (currPt[1] < nextPt[1]) ? [currPt[0], currPt[1] + 1] : [currPt[0], currPt[1] - 1];
    //                     }
    //                     else if (currPt[1] == nextPt[1]) {
    //                         if (currPt[0] > nextPt[0]) {
    //                             if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.straight_left) {
    //                                 btwnTile = terrainArray.diag_SW;
    //                             }
    //                             else if (nextTile == terrainArray.diag_NE || nextTile == terrainArray.corner_SE || nextTile == terrainArray.straight_right) {
    //                                 btwnTile = terrainArray.diag_SE;
    //                             }
    //                             btwnPt = [currPt[0] - 1, currPt[1]];
    //                         }
    //                     }
    //                     else {
    //                         if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
    //                             btwnTile = terrainArray.diag_NW;
    //                             btwnPt = [currPt[0], currPt[1] - 1];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
    //                             btwnTile = terrainArray.diag_NE;
    //                             btwnPt = [currPt[0], currPt[1] + 1];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
    //                             btwnTile = terrainArray.corner_NE;
    //                             btwnPt = [currPt[0], currPt[1] - 1];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SW
    //                             btwnTile = terrainArray.corner_NW;
    //                             btwnPt = [currPt[0], currPt[1] + 1];
    //                         }
    //                     }

    //                 }
    //                 else if (currTile == terrainArray.straight_down) {
    //                     console.log('down')
    //                     if (currPt[0] == nextPt[0]) {
    //                         if (currPt[1] < nextPt[1]) {
    //                             btwnTile = (nextTile == terrainArray.diag_SW ||  terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_down;
    //                         }
    //                         else {
    //                             btwnTile = (nextTile == terrainArray.diag_SE ||  terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_down;
    //                         }
    //                         btwnPt = (currPt[1] < nextPt[1]) ? [currPt[0], currPt[1] + 1] : [currPt[0], currPt[1] - 1];
    //                     }
    //                     else if (currPt[1] == nextPt[1]) {
    //                         if (currPt[0] < nextPt[0]) {
    //                             if (nextTile == terrainArray.diag_SW  || nextTile == terrainArray.corner_NW || nextTile == terrainArray.straight_left) { 
    //                                 btwnTile = terrainArray.diag_NW;
    //                             }
    //                             else if (nextTile == terrainArray.diag_SE  || nextTile == terrainArray.corner_NE || nextTile == terrainArray.straight_right) { 
    //                                 btwnTile = terrainArray.diag_NE;
    //                             }
    //                             btwnPt = [currPt[0] + 1, currPt[1]];
    //                         }
    //                     }
    //                     else {
    //                         if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
    //                             btwnTile = terrainArray.corner_SW;
    //                             btwnPt = [currPt[0], currPt[1] + 1];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
    //                             btwnTile = terrainArray.corner_SE;
    //                             btwnPt = [currPt[0], currPt[1] - 1];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SE
    //                             btwnTile = terrainArray.diag_SE;
    //                             btwnPt = [currPt[0], currPt[1] + 1];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SW
    //                             btwnTile = terrainArray.diag_SW;
    //                             btwnPt = [currPt[0], currPt[1] - 1];
    //                         }
    //                     }

    //                 }
    //                 else if (currTile == terrainArray.straight_left) {
    //                     console.log('left')
    //                     if (currPt[1] == nextPt[1]) {
    //                         if (currPt[0] < nextPt[0]) {
    //                             btwnTile = (nextTile == terrainArray.diag_NW ||  terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_left;
    //                         }
    //                         else {
    //                             btwnTile = (nextTile == terrainArray.diag_SW ||  terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_left;
    //                         }
    //                         btwnPt = (currPt[0] < nextPt[0]) ? [currPt[0] + 1, currPt[1]] : [currPt[0] - 1, currPt[1]];
    //                     }
    //                     else if (currPt[0] == nextPt[0]) {
    //                         if (currPt[1] > nextPt[1]) {
    //                             if (nextTile == terrainArray.diag_SW || nextTile == terrainArray.diag_SE || nextTile == terrainArray.straight_down) {
    //                                 btwnTile = terrainArray.diag_SE;
    //                             }
    //                             else if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.diag_NE || nextTile == terrainArray.straight_up) {
    //                                 btwnTile = terrainArray.diag_NE;
    //                             }
    //                             btwnPt = [currPt[0], currPt[1] - 1];
    //                         }
    //                     }
    //                     else {
    //                         if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_NW
    //                             btwnTile = terrainArray.diag_NW;
    //                             btwnPt = [currPt[0] - 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
    //                             btwnTile = terrainArray.corner_NW;
    //                             btwnPt = [currPt[0] + 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
    //                             btwnTile = terrainArray.corner_SW;
    //                             btwnPt = [currPt[0] - 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SW
    //                             btwnTile = terrainArray.diag_SW;
    //                             btwnPt = [currPt[0] + 1, currPt[1]];
    //                         }
    //                     }

    //                 }
    //                 else if (currTile == terrainArray.straight_right) {
    //                     console.log('right')
    //                     if (currPt[1] == nextPt[1]) {
    //                         if (currPt[0] < nextPt[0]) {
    //                             btwnTile = (nextTile == terrainArray.diag_SE ||  terrainArray.corner_SW) ? terrainArray.diag_NE : terrainArray.straight_right;
    //                         }
    //                         else {
    //                             btwnTile = (nextTile == terrainArray.diag_NE ||  terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_right;
    //                         }
    //                         btwnPt = (currPt[0] < nextPt[0]) ? [currPt[0] + 1, currPt[1]] : [currPt[0] - 1, currPt[1]];
    //                     }
    //                     else if (currPt[0] == nextPt[0]) {
    //                         if (currPt[1] < nextPt[1]) {
    //                             if (nextTile == terrainArray.diag_SE ||  terrainArray.corner_SW || nextTile == terrainArray.straight_down) {
    //                                 btwnTile = terrainArray.diag_SW;
    //                             }
    //                             else if (nextTile == terrainArray.diag_NE ||  terrainArray.corner_NW || nextTile == terrainArray.straight_up) {
    //                                 btwnTile = terrainArray.diag_NW;
    //                                 btwnPt = [currPt[0], currPt[1] + 1];
    //                             }
    //                         } 
    //                         // else {

    //                         // }
    //                         // btwnTile = terrainArray.diag_SW;
    //                         // btwnPt = [currPt[0], currPt[1] + 1];
    //                     } 
    //                     else {
    //                         if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NW
    //                             btwnTile = terrainArray.corner_NE;
    //                             btwnPt = [currPt[0] + 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] > nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_NE
    //                             btwnTile = terrainArray.diag_NE;
    //                             btwnPt = [currPt[0] - 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] > nextPt[1]) { // nextTile == terrainArray.corner_SE
    //                             btwnTile = terrainArray.diag_SE;
    //                             btwnPt = [currPt[0] + 1, currPt[1]];
    //                         }
    //                         else if (currPt[0] < nextPt[0] && currPt[1] < nextPt[1]) { // nextTile == terrainArray.corner_SW
    //                             btwnTile = terrainArray.corner_SE;
    //                             btwnPt = [currPt[0] - 1, currPt[1]];
    //                         }
    //                     }
    //                 }
    //             }
    //             outerTrack.splice(i + 1, 0, btwnPt);
    //             this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
    //             console.log("len", outerTrack.length)
    //             // i--; //??? i++??
    //         }
    //     }
    //     console.log('outer')
    // }

}