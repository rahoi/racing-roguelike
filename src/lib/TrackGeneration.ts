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
                if (prevPt[0] - splinePts[i][0] > 0) {
                    // console.log("prev x bigger")
                    tempPt = [prevPt[0] - 1, prevPt[1]];
                } else if (prevPt[0] - splinePts[i][0] < 0) {
                    // console.log("prev x smaller")
                    tempPt = [prevPt[0] + 1, prevPt[1]];
                }
                if (tempPt == splinePts[prevPrevInd]) {
                    tempPt[0] = splinePts[i][0];
                    tempPt[1] = prevPt[1];
                }
                splinePts.splice(i, 0, tempPt);

                xDiff = Math.abs(prevPt[0] - splinePts[i][0]);
                yDiff = Math.abs(prevPt[1] - splinePts[i][1]);
            }

            if (xDiff == 0 && yDiff != 0) {
                if (prevPt[1] - splinePts[i][1] > 1) {
                    // console.log("prev y bigger")
                    tempPt = [prevPt[0], prevPt[1] - 1];
                    splinePts.splice(i, 0, tempPt);
                } else if (prevPt[1] - splinePts[i][1] < 1) {
                    // console.log("prev y smaller")
                    tempPt = [prevPt[0], prevPt[1] + 1];
                    splinePts.splice(i, 0, tempPt);
                }
            }

            prevPrevInd++;
            prevPt = splinePts[i];
        }
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

        for (let i = 0; i < splinePts.length; i++) {
            this.mapArray[splinePts[i][0]][splinePts[i][1]] = 252;
            // this.mapArray[splinePts[i][0]][splinePts[i][1]] = 221
        }

        this.firstPt = splinePts[0];
        // console.log(JSON.stringify(splinePts));
    }

    // getMapArray() {
    //     return this.mapArray;
    // }

    // getFirstPt() {
    //     return this.firstPt;
    // }

}
