import type ConfigData from "./ConfigData"
import terrainArray from "./TerrainArray"
// works in node, not on browser
import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"
import * as three from "three"
import { Vector2 } from "three"

export default class TrackGeneration {
    mapArray:number[][];
    firstPt:number[];
    margin:number;
    borderWidth:number;
    borderHeight:number;
    numPts:number;
    mapHeight:number;
    mapWidth:number;

    constructor(mapConfigData:ConfigData) {
        this.mapArray = [];
        this.firstPt = [];

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.1;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);
        this.numPts = 20;
    }

    generateRandomPoints() {
        // generating random points
        // let points:number[][] = [];
        let points:three.Vector2[];

        for (let i = 0; i < this.numPts; i++) {
            // let temp:number[] = [];
            
            let x:number = Math.random() * (this.mapWidth - 2 * this.borderWidth) + this.borderWidth;
            let y:number = Math.random() * (this.mapHeight - 2 * this.borderHeight) + this.borderHeight;
            let temp:three.Vector2 = new Vector2(x, y);

            points.push(temp);
        }
        console.log("points: ", JSON.stringify(points));
        return points;
    }

    findConvexHull(points:number[][]) {
        // calculating convex hull points
        const concavityVal:number = 20;   // from 1 to inf, closer to 1: hugs shape more
        let convexHull:object[] = [];

        convexHull = hull(points, concavityVal);
        convexHull.pop();

        // console.log("hull: ", JSON.stringify(convexHull));
        return convexHull as number[][];
    }

    findSpline(convexHull:number[][]) {
        // calculating catmull rom spline points
        // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        const alpha:number = 0.75;
        const ptsBtHull:number = 5;

        let splinePts:number[][] = [];

        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        for (let i = 0; i < splinePts.length; i++) {
            splinePts[i][0] = Math.trunc(splinePts[i][0]);
            splinePts[i][1] = Math.trunc(splinePts[i][1]);
        }
        splinePts.push([splinePts[0][0], splinePts[0][1]]);

        // console.log("spline: ", JSON.stringify(splinePts));
        return splinePts;
    }

    fillInLoop(splinePts:number[][]) {
        // filling in polygon
        let loop:number[][] = splinePts;
        let prevPrevInd:number = -1;
        let prevPt:number[] = loop[0];

        for (let i = 1; i < loop.length; i++) {
            if (prevPt[0] == loop[i][0] && prevPt[1] == loop[i][1]) {
                loop.splice(i, 1);
                i--;
                prevPt = loop[i];
                continue;
            }

            if (i == loop.length) {
                continue;
            }

            let xDiff:number = Math.abs(prevPt[0] - loop[i][0]);
            let yDiff:number = Math.abs(prevPt[1] - loop[i][1]);
            let tempPt:number[] = prevPt;
            

            if (xDiff != 0) {
                if (prevPt[0] - loop[i][0] > 0) {
                    // console.log("prev x bigger")
                    tempPt = [prevPt[0] - 1, prevPt[1]];
                } else if (prevPt[0] - loop[i][0] < 0) {
                    // console.log("prev x smaller")
                    tempPt = [prevPt[0] + 1, prevPt[1]];
                }
                if (tempPt == loop[prevPrevInd]) {
                    tempPt[0] = loop[i][0];
                    tempPt[1] = prevPt[1];
                }
                loop.splice(i, 0, tempPt);

                xDiff = Math.abs(prevPt[0] - loop[i][0]);
                yDiff = Math.abs(prevPt[1] - loop[i][1]);
            }

            if (xDiff == 0 && yDiff != 0) {
                if (prevPt[1] - loop[i][1] > 1) {
                    // console.log("prev y bigger")
                    tempPt = [prevPt[0], prevPt[1] - 1];
                    loop.splice(i, 0, tempPt);
                } else if (prevPt[1] - loop[i][1] < 1) {
                    // console.log("prev y smaller")
                    tempPt = [prevPt[0], prevPt[1] + 1];
                    loop.splice(i, 0, tempPt);
                }
            }

            prevPrevInd++;
            prevPt = loop[i];
        }

        // console.log("loop: ");
        // for (let i = 0; i < loop.length; i++) {
        //     console.log("(", loop[i][0], ", ", loop[i][1], ")");
        // }
        return loop;
    }

    createMapArray() {
        // creating mapArray matrix
        let points:number[][] = this.generateRandomPoints();
        let convexHull:number[][] = this.findConvexHull(points);


        let pushIt:number = 3;
        for(let i = 0; i < pushIt; ++i) {  
            convexHull = this.pushPtsApart(convexHull);  
        } 

        let splinePts:number[][] = this.findSpline(convexHull);
        let loop:number[][] = this.fillInLoop(splinePts);


        for (let i = 0; i < this.mapHeight; i++) {
            let temp:number[] = [];
            for (let j = 0; j < this.mapWidth; j++) {
                temp.push(162);
            }
            this.mapArray.push(temp)
        }

        let prev:number[] = loop[0];
        let curr:number[];
        let next:number[];
        for (let i = 1; i < loop.length; i++) {
            curr = loop[i];
            if (i < loop.length - 1) {
                next = loop[i + 1];
            }
            else {
                next = loop[1];
            }

            this.determineTileToPlace(prev, curr, next);

            prev = curr;
            // this.mapArray[loop[i][0]][loop[i][1]] = 252;
            // this.mapArray[splinePts[i][0]][splinePts[i][1]] = 221
        }

        this.firstPt = loop[0];
        // console.log(JSON.stringify(loop));
        // console.log(JSON.stringify(this.mapArray))
    }

    determineTileToPlace(prev:number[], curr:number[], next:number[]) {
        if (prev[0] == curr[0]) {
            if (next[0] == curr[0]) {
                this.fillHorizontal(curr);
            }
            else if (prev[1] < curr[1]) {
                if (next[0] < curr[0]) {
                    this.fillSE(curr);
                }
                else if (next[0] > curr[0]) {
                    this.fillNE(curr);
                }
            }
            else if (prev[1] > curr[1]) {
                if (next[0] < curr[0]) {
                    this.fillSW(curr);
                }
                else if (next[0] > curr[0]) {
                    this.fillNW(curr);
                } 
            }
        }

        else if (prev[1] == curr[1]) {
            if (next[1] == curr[1]) {
                this.fillVertical(curr);
            }
            else if (prev[0] < curr[0]) {
                if (next[1] < curr[1]) {
                    this.fillSE(curr);
                }
                else if (next[1] > curr[1]) {
                    this.fillSW(curr);
                }
            }
            else if (prev[0] > curr[0]) {
                if (next[1] < curr[1]) {
                    this.fillNE(curr);
                }
                else if (next[1] > curr[1]) {
                    this.fillNW(curr);
                } 
            }
        }
    }

    fillHorizontal(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.horizontal;
    }

    fillVertical(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.vertical;
    }

    fillNW(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.NW;
    }

    fillNE(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.NE;
    }

    fillSE(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.SE;
    }

    fillSW(mapCoord:number[]) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = terrainArray.SW;
    }


    pushPtsApart(points:number[][]) {  
        let dist:number = 15; //I found that 15 is a good value, though maybe, depending on your scale you'll need other value.  
        let dist2:number = dist ** 2;
        let distSq:number;

        for (let i = 0; i < points.length; ++i) {
            for (let j = i + 1; j < points.length; ++j) {
                distSq = ((points[j][0] - points[i][0]) ** 2) + ((points[j][1] - points[i][1]) ** 2);

                if (distSq < dist2) {
                    let dx = points[j][0] - points[i][0];
                    let dy = points[j][1] - points[i][1];
                    let dl = Math.sqrt(dx ** 2 + dy ** 2);
                    dx /= dl;
                    dy /= dl;
                    let dif = dist - dl;
                    dx *= dif;
                    dy *= dif;
                    points[j][0] += dx;
                    points[j][1] += dy; 
                    points[i][0] -= dx;
                    points[i][1] -= dy; 
                }
            }
        }

        return points;
    }

    adjustConvexity(dataSet:number[][]) {
        let rSet:number[][] = new Vector2[dataSet.length * 2];  
        let disp:number[] = new Vector2();  
        let difficulty:number = 1; //the closer the value is to 0, the harder the track should be. Grows exponentially.  
        let maxDisp:number = 20; // Again, this may change to fit your units.  
        
        for(let i = 0; i < dataSet.length; ++i) {  
            let dispLen:number = Math.pow(Random(0, 1), difficulty) * maxDisp;  
            disp.set(0, 1);  
            disp.rotate(MathUtils.random(0, 1) * 360);  
            disp.scale(dispLen);  
            rSet[i*2] = dataSet[i];  
            rSet[i*2 + 1] = new Vector2(dataSet[i]);  
            rSet[i*2 + 1].add(dataSet[(i+1)%dataSet.length]).divide(2).add(disp);  
            //Explaining: a mid point can be found with (dataSet[i]+dataSet[i+1])/2.  
            //Then we just add the displacement.  
        } 

        dataSet = rSet;  
        
        //push apart again, so we can stabilize the points distances.  
        for(let i = 0; i < pushIterations; ++i) {  
            this.pushPtsApart(dataSet);  
        }  
    }

    // getMapArray() {
    //     return this.mapArray;
    // }

    // getFirstPt() {
    //     return this.firstPt;
    // }

}
