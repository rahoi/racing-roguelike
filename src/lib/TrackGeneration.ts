import type ConfigData from "./ConfigData"
import terrainArray from "./TerrainArray"
// works in node, not on browser
import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"

export default class TrackGeneration {
    mapArray: number[][];
    firstPt: number[];
    margin: number;
    borderWidth: number;
    borderHeight: number;
    numPts: number;
    mapHeight: number;
    mapWidth: number;

    constructor(mapConfigData: ConfigData) {
        this.mapArray = [];
        this.firstPt = [];

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.05;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);
        this.numPts = 30;
    }

    createMapArray() {
        // creating mapArray matrix

        let points: number[][] = this.generateRandomPoints();
        let convexHull: number[][] = this.findConvexHull(points);
        let splinePts: number[][] = this.findSpline(convexHull);


        for (let i = 0; i < this.mapHeight; i++) {
            let temp: number[] = [];
            for (let j = 0; j < this.mapWidth; j++) {
                temp.push(162);
            }

            this.mapArray.push(temp)
        }

        let trackCoordinates = this.fillInLoop(splinePts);
        trackCoordinates = this.removeLoops(trackCoordinates);
        this.firstPt = trackCoordinates[0];

        for (let i = 0; i < trackCoordinates.length; i++) {
            this.mapArray[trackCoordinates[i][0]][trackCoordinates[i][1]] = 252;
            // this.mapArray[splinePts[i][0]][splinePts[i][1]] = 221
        }

        // console.log(JSON.stringify(splinePts));

    }

    generateRandomPoints() {
        // generating random points
        let points: number[][] = [];

        for (let i = 0; i < this.numPts; i++) {
            let temp:number[] = [];
            temp[0] = Math.random() * (this.mapWidth - 2 * this.borderWidth) + this.borderWidth;
            temp[1] = Math.random() * (this.mapHeight - 2 * this.borderHeight) + this.borderHeight;

            points.push(temp);
        }
        return points;
    }

    findConvexHull(points: number[][]) {
        // calculating convex hull points
        const concavityVal: number = 15;   // from 1 to inf, closer to 1: hugs shape more
        let convexHull: object[] = [];

        convexHull = hull(points, concavityVal);
        convexHull.pop();

        return convexHull as number[][];
    }

    findSpline(convexHull: number[][]) {
        // calculating catmull rom spline points
        // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        const alpha:number = 0.75;
        const ptsBtHull:number = 5;

        let splinePts: number[][] = [];

        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        for (let i = 0; i < splinePts.length; i++) {
            splinePts[i][0] = Math.trunc(splinePts[i][0]);
            splinePts[i][1] = Math.trunc(splinePts[i][1]);
        }
        splinePts.push([splinePts[0][0], splinePts[0][1]]);

        return splinePts;
    }

    fillInLoop(splinePts: number[][]) {
        // filling in polygon
        let prevPrevInd:number = -1;
        let prevPt:number[] = splinePts[0];


        for (let i = 1; i < splinePts.length; i++) {
            if (prevPt[0] == splinePts[i][0] && prevPt[1] == splinePts[i][1]) {
                splinePts.splice(i, 1);
                i--;
                prevPt = splinePts[i];
                continue;
            }

            if (i == splinePts.length) {
                continue;
            }

            let xDiff:number = Math.abs(prevPt[0] - splinePts[i][0]);
            let yDiff:number = Math.abs(prevPt[1] - splinePts[i][1]);
            let tempPt:number[] = prevPt;

            if (xDiff != 0) {
                tempPt = (prevPt[0] - splinePts[i][0] > 0) ? [prevPt[0] - 1, prevPt[1]] : [prevPt[0] + 1, prevPt[1]]; // if curr height smaller

                if (tempPt == splinePts[prevPrevInd]) {
                    tempPt[0] = splinePts[i][0];
                    tempPt[1] = prevPt[1];
                }
                splinePts.splice(i, 0, tempPt);

                xDiff = Math.abs(prevPt[0] - splinePts[i][0]);
                yDiff = Math.abs(prevPt[1] - splinePts[i][1]);
            }
            else if (yDiff != 0) {
                tempPt = (prevPt[1] - splinePts[i][1] > 0) ? [prevPt[0], prevPt[1] - 1] : tempPt = [prevPt[0], prevPt[1] + 1]; // if curr width smaller
                splinePts.splice(i, 0, tempPt);

            }

            prevPrevInd++;
            prevPt = splinePts[i];
        }

        return splinePts;
    }

    removeLoops(trackCoordinates:number[][]) {
        let coordinateMap = new Map<string, number[]>();
        let originialTrackLength = trackCoordinates.length;

        // fill map with key: coordinate, value: array of indicies from loop
        for (let i = 0; i < trackCoordinates.length - 1; i++) {
            let coordKey:string = JSON.stringify(trackCoordinates[i]);

            if (coordinateMap.get(coordKey) == null) {
                coordinateMap.set(coordKey, [i]);
            } else {
                coordinateMap.set(coordKey, [...coordinateMap.get(coordKey), i]);
            }
        }

        // if there are duplicate coordinates
        if (coordinateMap.size < originialTrackLength) {
            for (let [coordKey, loopIndicesArray] of coordinateMap) {
                if (loopIndicesArray.length >= 2) {
                    // find shortest loop 
                    let loopStart:number;
                    let shortestLoop:number;

                    // if already removed one loop, recheck for indices
                    if (originialTrackLength > trackCoordinates.length) {
                        let tempArray:number[] = [];

                        for (let i = 0 ; i < trackCoordinates.length; i++) {
                            if (coordKey == JSON.stringify(trackCoordinates[i])) {
                                tempArray.push(i);
                            }
                        }
                        loopIndicesArray = tempArray;
                    }

                    // find shortest loop 
                    let lastLoopIndex:boolean = false;
                    let endOfTrackIndex:boolean = false;
                    for (let i = 0 ; i < loopIndicesArray.length; i++) {
                        if (i == 0) {   // if index is first in loop array
                            loopStart = 0;
                            shortestLoop = Math.abs(loopIndicesArray[1] - loopIndicesArray[0]);
                        } else {
                            let nextIndex:number = (loopIndicesArray[i] == trackCoordinates.length - 2) ? loopIndicesArray[0] : loopIndicesArray[i + 1];
                            let tempLength:number = (loopIndicesArray[i] == trackCoordinates.length - 2) ? loopIndicesArray[0] : Math.abs(nextIndex - loopIndicesArray[i]);

                            // if loop starts at last index in loop array (not last in entire track array)
                            if (i == loopIndicesArray.length - 1 && loopIndicesArray[i] != trackCoordinates.length - 2) {
                                nextIndex = loopIndicesArray[0];
                                tempLength = trackCoordinates.length - 1 - loopIndicesArray[i] + loopIndicesArray[0];
                            }

                            shortestLoop = Math.min(shortestLoop, tempLength);
                            if (tempLength == shortestLoop) {
                                endOfTrackIndex = (loopIndicesArray[i] == trackCoordinates.length - 2) ? true : false;
                                lastLoopIndex = (!endOfTrackIndex && i == loopIndicesArray.length - 1) ? true :false;

                                loopStart = i;
                            }
                        }
                    }

                    if (endOfTrackIndex) {    // if loop starts at last track point
                        trackCoordinates.splice(trackCoordinates.length - 1, 1);
                        trackCoordinates.splice(0, shortestLoop);

                    } else if (lastLoopIndex) {   // if loop starts at last index in loop array
                        let currTrackLen:number = trackCoordinates.length;
                        trackCoordinates.splice(loopIndicesArray[loopStart] + 1, currTrackLen - 1 - loopIndicesArray[loopStart]);
                        trackCoordinates.splice(0, shortestLoop - (currTrackLen - 1 - loopIndicesArray[loopStart]));

                    } else {    // if loop doesnt start at end of track array
                        trackCoordinates.splice(loopIndicesArray[loopStart], shortestLoop);
                    }
                    
                }
            }
        }

        return trackCoordinates;
    }

}
