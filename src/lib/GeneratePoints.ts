import type ConfigData from "./ConfigData.js"
import terrainArray from "./TerrainArray.js"

import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"


export default class GeneratePoints {
    numPts:number;
    startLine:number[];
    startIndex:number;
    startTile:number;
    playerStartPt:number[];
    isClockwise:boolean;

    mapHeight:number;
    mapWidth:number;

    margin:number;
    borderWidth:number;
    borderHeight:number;

    concavityVal:number;

    convexityDifficulty:number;
    convexityDisp:number;

    trackAngle:number;

    splineAlpha:number;
    splinePtsBtHull:number;

    minTrackLength:number;
    maxTrackLength:number;

    constructor(numPts:number, margin:number, concavityVal:number, convexityDifficulty:number, convexityDisp:number, trackAngle:number, 
        splineAlpha:number, splinePtsBtHull:number, minTrackLength:number, maxTrackLength:number, mapConfigData:ConfigData) {
        this.numPts = numPts;

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = margin;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);

        this.concavityVal = concavityVal;   // from 1 to inf, closer to 1: hugs shape more

        this.convexityDifficulty = convexityDifficulty;
        this.convexityDisp = 10; //the closer the value is to 0, the harder the track should be 

        this.trackAngle = trackAngle; // in degrees

        this.splineAlpha = splineAlpha; // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        this.splinePtsBtHull = splinePtsBtHull;

        this.minTrackLength = minTrackLength;
        this.maxTrackLength = maxTrackLength;
    }

    generateRandomPoints() {
        // generating random points
        let points:number[][] = [];

        for (let i = 0; i < this.numPts; i++) {
            let temp:number[] = [];
            temp[0] = Math.random() * (this.mapHeight - 2 * this.borderHeight) + this.borderHeight;
            temp[1] = Math.random() * (this.mapWidth - 2 * this.borderWidth) + this.borderWidth;

            points.push(temp);
        }

        return points;
    }

    findConvexHull(points:number[][]) {
        // calculating convex hull points
        let convexHull:object[] = [];

        convexHull = hull(points, this.concavityVal);
        convexHull.pop();

        return convexHull as number[][];
    }

    movePtsApart(points:number[][], distVal:number) {  
        // let distVal:number = 10; //I found that 15 is a good value, though maybe, depending on your scale you'll need other value.  
        let maxDist:number = distVal ** 2;
        let distBtPts:number;

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; ++j) {
                distBtPts = ((points[j][0] - points[i][0]) ** 2) + ((points[j][1] - points[i][1]) ** 2);

                // console.log("dist",distSq)
                if (distBtPts < maxDist) {
                    let dx = points[j][0] - points[i][0];
                    let dy = points[j][1] - points[i][1];
                    let dl = Math.sqrt(dx ** 2 + dy ** 2);
                    dx /= dl;
                    dy /= dl;
                    let diff = distVal - dl;
                    dx *= diff;
                    dy *= diff;
                    points[j][0] += dx;
                    points[j][1] += dy; 
                    points[i][0] -= dx;
                    points[i][1] -= dy; 

                    points[i] = this.checkPtWithinBorder(points[i]);

                    points[j] = this.checkPtWithinBorder(points[j]);
                }
            }
        }

        return points;
    }

    checkPtWithinBorder(coordinate:number[]) {
        // if less than border
        let minHeight:number = this.borderHeight;
        let minWidth:number = this.borderWidth;

        // if less than border
        coordinate[0] = coordinate[0] < minHeight ? minHeight : coordinate[0];
        coordinate[1] = coordinate[1] < minWidth ? minWidth : coordinate[1];

        // if greater than border
        let maxHeight:number = this.mapHeight - this.borderHeight;
        let maxWidth:number = this.mapWidth - this.borderWidth;

        coordinate[0] = coordinate[0] >= maxHeight  ? maxHeight : coordinate[0];
        coordinate[1] = coordinate[1] >= maxWidth ? maxWidth : coordinate[1];

        return coordinate;
    }

    adjustConvexity(points:number[][]) {
        let adjustedPoints:number[][] = [];  
        let displacement:number[] = [];  


        for(let i = 0; i < points.length; i++) {  
            let dispLen:number = (Math.random() ** this.convexityDifficulty) * this.convexityDisp;  
            displacement = [0, 1];  

            let rotationRad = (Math.random() * 360) * Math.PI / 180
            displacement = this.rotatePt(displacement, rotationRad);
            displacement[0] *= dispLen
            displacement[1] *= dispLen

            adjustedPoints[i * 2] = points[i];  
            adjustedPoints[i * 2 + 1] = points[i];  
      
            let nextPt:number[];
            nextPt = i < points.length - 1 ? points[i + 1] : points[0];

            let temp:number[] = [];
            // midpoint calculation
            temp[0] = (adjustedPoints[i * 2 + 1][0] + nextPt[0]) / 2 + displacement[0];
            temp[1] = (adjustedPoints[i * 2 + 1][1] + nextPt[1]) / 2 + displacement[1];

            temp = this.checkPtWithinBorder(temp);

            adjustedPoints[i * 2 + 1] = temp;
        }

        return adjustedPoints;
    }

    rotatePt(point:number[], radians:number) {
        let cos = Math.cos(radians);
		let sin = Math.sin(radians);

		let x = point[0] * cos - point[1] * sin;
		let y = point[0] * sin + point[1] * cos;

		point[0] = x;
		point[1] = y;

        return point;
    }

    fixTrackAngles(points:number[][]) {
        for(let i = 0; i < points.length; i++) {  
            let prev:number = (i - 1 < 0) ? points.length-1 : i-1;  
            let next:number = (i + 1) % points.length;  

            let px:number = points[i][0] - points[prev][0];  
            let py:number = points[i][1] - points[prev][1];  
            let pl:number = Math.sqrt(px ** 2 + py ** 2);  
            px /= pl;  
            py /= pl;  
            
            let nx:number = points[i][0] - points[next][0];
            let ny:number = points[i][1] - points[next][1];
            nx = -nx;  
            ny = -ny;  
            let nl:number = Math.sqrt(nx**2 + ny**2);  
            nx /= nl;  
            ny /= nl;  
            //I got a vector going to the next and to the previous points, normalised.  

            let a:number = Math.atan2((px * ny - py * nx), (px * nx + py * ny)); // perp dot product between the previous and next point. Google it you should learn about it!  

            if(Math.abs(a * 180 / Math.PI) <= this.trackAngle) continue;  

            let nA = this.trackAngle * Math.sign(a) * Math.PI / 180;  
            let diff = nA - a;  
            let cos = Math.cos(diff);  
            let sin = Math.sin(diff);  
            let newX = nx * cos - ny * sin;  
            let newY = nx * sin + ny * cos;  
            newX *= nl;  
            newY *= nl;  
            points[next][0] = points[i][0] + newX;  
            points[next][1] = points[i][1] + newY;  

            // if less than 0
            points[next] = this.checkPtWithinBorder(points[next]);
            //I got the difference between the current angle and 100degrees, and built a new vector that puts the next point at 100 degrees.  
        }

        return points;
    }

    findSpline(convexHull:number[][]) {
        // calculating catmull rom spline points
        let splinePts:number[][] = [];

        splinePts = catmulRomInterpolation(convexHull, this.splineAlpha, this.splinePtsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, this.splineAlpha, this.splinePtsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, this.splineAlpha, this.splinePtsBtHull, true);

        for (let i = 0; i < splinePts.length; i++) {
            splinePts[i][0] = Math.trunc(splinePts[i][0]);
            splinePts[i][1] = Math.trunc(splinePts[i][1]);
        }
        splinePts.push([splinePts[0][0], splinePts[0][1]]);

        return splinePts;
    }

    fillInTrack(splinePts:number[][]) {
        // filling in polygon
        let trackCoordinates:number[][] = splinePts;
        let prevPrevInd:number = -1;
        let prevPt:number[] = trackCoordinates[0];

        for (let i = 1; i < trackCoordinates.length; i++) {
            if (prevPt[0] == trackCoordinates[i][0] && prevPt[1] == trackCoordinates[i][1]) {
                trackCoordinates.splice(i, 1);
                i--;
                prevPt = trackCoordinates[i];
                continue;
            }

            if (i == trackCoordinates.length) {
                continue;
            }

            let xDiff:number = Math.abs(prevPt[0] - trackCoordinates[i][0]);
            let yDiff:number = Math.abs(prevPt[1] - trackCoordinates[i][1]);
            let tempPt:number[] = prevPt;

            // if (xDiff != 0 || yDiff != 0) {
            //     let lengthBeforeFill = trackCoordinates.length;
            //     trackCoordinates = this.fillBtPts(trackCoordinates, i);
            //     i += trackCoordinates.length - lengthBeforeFill;
            // }

            if (xDiff != 0) {
                tempPt = (prevPt[0] - trackCoordinates[i][0] > 0) ? [prevPt[0] - 1, prevPt[1]] : [prevPt[0] + 1, prevPt[1]];

                // if (prevPt[0] - trackCoordinates[i][0] > 0) {
                //     // console.log("curr height smaller")
                //     tempPt = [prevPt[0] - 1, prevPt[1]];
                //     // if (terrainArray.all_roads.includes(this.mapArray[tempPt[0]][tempPt[1]])) {
                //     //     tempPt =  ? [prevPt[0], prevPt[1]] : tempPt;
                //     // }
                    
                // } else if (prevPt[0] - trackCoordinates[i][0] < 0) {
                //     // console.log("curr height greater")
                //     tempPt = [prevPt[0] + 1, prevPt[1]];
                // }
                if (tempPt == trackCoordinates[prevPrevInd]) {
                    tempPt[0] = trackCoordinates[i][0];
                    tempPt[1] = prevPt[1];
                }
                trackCoordinates.splice(i, 0, tempPt);

                xDiff = Math.abs(prevPt[0] - trackCoordinates[i][0]);
                yDiff = Math.abs(prevPt[1] - trackCoordinates[i][1]);
            }
            else if (yDiff != 0) {
                tempPt = (prevPt[1] - trackCoordinates[i][1] > 0) ? [prevPt[0], prevPt[1] - 1] : tempPt = [prevPt[0], prevPt[1] + 1];
                trackCoordinates.splice(i, 0, tempPt);

                // if (prevPt[1] - trackCoordinates[i][1] > 0) {
                //     // console.log("prev y bigger")
                //     tempPt = [prevPt[0], prevPt[1] - 1];
                //     trackCoordinates.splice(i, 0, tempPt);
                // } else if (prevPt[1] - trackCoordinates[i][1] < 0) {
                //     // console.log("prev y smaller")
                //     tempPt = [prevPt[0], prevPt[1] + 1];
                //     trackCoordinates.splice(i, 0, tempPt);
                // }
            }

            prevPrevInd++;
            prevPt = trackCoordinates[i];
        }

        let track = this.removeLoops(trackCoordinates);
        // let track = this.removeSnaking(tempTrack);

        return track;
    }

    // fillBtPts(trackCoordinates:number[][], index:number) {
    //     let tempPt:number[] = [];
    //     let prevPt:number[] = trackCoordinates[index - 1];
    //     let currPt:number[] = trackCoordinates[index];
    //     let lastPt:number[] = trackCoordinates[index];
    //     let count:number = 0;

    //     while (tempPt != lastPt) {
    //         tempPt = prevPt;
    //         if (count % 2 == 0) {
    //             if (prevPt[0] == currPt[0]) {
    //                 tempPt[0] = prevPt[0];
    //             } else if (prevPt[0] < currPt[0]) {
    //                 tempPt[0] = prevPt[0] + 1;
    //             } else if (prevPt[0] > currPt[0]) {
    //                 tempPt[0] = prevPt[0] - 1;
    //             }

                

    //         } else {
    //             if (prevPt[1] < currPt[1]) {
    //                 tempPt[1] = prevPt[1] + 1;
    //             } else if (prevPt[1] > currPt[0]) {
    //                 tempPt[1] = prevPt[1] - 1;
    //             } else {
    //                 tempPt[1] = prevPt[1];
    //             }


    //         }

    //         if (tempPt != currPt) {
    //             trackCoordinates.splice(index + count, 0, tempPt);
    //         }

    //         count++;
    //         prevPt = trackCoordinates[index - 1 + count];
    //         currPt = trackCoordinates[index + count];
    //     }

    //     return trackCoordinates;
    // }

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

    removeSnaking (trackCoordinates:number[][]) {
        type coordinates = {
            index:number;
            numNeighbors:number;
            downVert?:number[];  // neighrbor has bigger x (first coord)
            upVert?:number[];  // neighrbor has smaller x
            leftHorz?:number[];  // neighrbor has smaller y (second coord)
            rightHorz?:number[];  // neighrbor has bigger y
        }
        let numNeighbors:number = 0;

        let snakingMap = new Map<string, coordinates>();

        for (let i = 0; i < trackCoordinates.length - 1; i++) {
            let stringKey:string = JSON.stringify(trackCoordinates[i]);

            let tempCoord:coordinates = {
                index : i,
                numNeighbors : 0,
                // prevVert : [],
                // nextVert : [],
                // prevHorz : [],
                // nextHorz : []
            }

            snakingMap.set(stringKey, tempCoord)
        }
        // console.log(snakingMap);


        for (let i = 0; i < trackCoordinates.length; i++) {
            // console.log("coord: ", trackCoordinates[k]);
            let stringKey:string = JSON.stringify(trackCoordinates[i]);

            let neighbors:number[][] = this.getNeighbors(trackCoordinates[i]);

            // console.log(neighbors);

            for (let j = 0; j < neighbors.length; j++) {
                let neighborKey = JSON.stringify(neighbors[j]);
                let tempCoord:coordinates | undefined = snakingMap.get(neighborKey);
                
                // console.log("temp: ", neighborKey, tempCoord);
                
                if (tempCoord != null) { 
                    if (neighbors[j][0] < trackCoordinates[i][0]) {
                        tempCoord.downVert = trackCoordinates[i];
                        tempCoord.numNeighbors++;
                        numNeighbors = Math.max(numNeighbors, tempCoord.numNeighbors);
                    } else if (neighbors[j][0] > trackCoordinates[i][0]) {
                        tempCoord.upVert = trackCoordinates[i];
                        tempCoord.numNeighbors++;
                        numNeighbors = Math.max(numNeighbors, tempCoord.numNeighbors);
                    } else if (neighbors[j][1] < trackCoordinates[i][1]) {
                        tempCoord.rightHorz = trackCoordinates[i];
                        tempCoord.numNeighbors++;
                        numNeighbors = Math.max(numNeighbors, tempCoord.numNeighbors);
                    } else if (neighbors[j][1] > trackCoordinates[i][1]) {
                        tempCoord.leftHorz = trackCoordinates[i];
                        tempCoord.numNeighbors++;
                        numNeighbors = Math.max(numNeighbors, tempCoord.numNeighbors);
                    }
                    
                    // console.log(neighborKey, tempCoord);
                    snakingMap.set(neighborKey, tempCoord);
                }
            }
        }

        let shortestSnake = Infinity;
        let startIndex = -1;
        let endIndex = -1;
        let reverse:boolean = false;

        for (let i = 0; i < trackCoordinates.length; i++) {
            let stringKey:string = JSON.stringify(trackCoordinates[i]);
            let tempCoord:coordinates | undefined = snakingMap.get(stringKey);

            // if (tempCoord != null && tempCoord.numNeighbors > 2) {
            //     if (startIndex == -1) {
            //         startIndex = i;
            //     } else if (startIndex != -1 && endIndex == -1) {
            //         endIndex = i;
            //         shortestSnake = Math.min(endIndex - startIndex - 1, trackCoordinates.length - endIndex + startIndex - 1);
            //         if (shortestSnake == trackCoordinates.length - endIndex + startIndex) {
            //             endIndex = startIndex;
            //             startIndex = i;
            //             reverse = true;
            //         }
            //     } else {
            //         console.log(i)
            //         let tempStart = Math.min(i - startIndex - 1, trackCoordinates.length - i + startIndex - 1);
            //         let tempEnd = Math.min(endIndex - i - 1, trackCoordinates.length - endIndex + i - 1);
            //         let temp = Math.min(tempStart, tempEnd);

            //         shortestSnake = Math.min(temp, shortestSnake);

            //         if (shortestSnake == temp) {
            //             if (temp == tempStart) {
            //                 endIndex = i;
            //                 if (temp == trackCoordinates.length - i + startIndex - 1) {
            //                     endIndex = startIndex;
            //                     startIndex = i;
            //                     reverse = true;
            //                 }
            //             } else {
            //                 startIndex = i;
            //                 if (temp == trackCoordinates.length - endIndex + i - 1) {
            //                     endIndex = startIndex;
            //                     startIndex = i;
            //                     reverse = true;
            //                 }
            //             }
            //         }
            //     }
            // }

        }

        // console.log(snakingMap)
        // console.log(trackCoordinates[startIndex]);
        // console.log(trackCoordinates[endIndex]);
        // console.log(shortestSnake);
        
        // trackCoordinates.splice(startIndex+ 1, shortestSnake);

        return numNeighbors;
    }

    getNeighbors(coordinate:number[]) {
        let neighbors:number[][] = [];

        let up:number[] = [coordinate[0] - 1, coordinate[1]];
        let down:number[] = [coordinate[0] + 1, coordinate[1]];
        let left:number[] = [coordinate[0], coordinate[1] - 1];
        let right:number[] = [coordinate[0], coordinate[1] + 1];

        neighbors.push(up, down, left, right);

        return neighbors;
    }

    findIfClockwiseTrack(trackCoordinates:number[][]) {
        let trackArea:number = this.findTrackArea(trackCoordinates);
        // console.log("trackArea: ", trackArea);

        this.isClockwise = (trackArea < 0) ? true : false;

        console.log("clockwise: ", this.isClockwise);

        return this.isClockwise;
    }

    findStartIndex(trackCoordinates:number[][]) {
        let startFound:boolean = false;
        let index:number = 2; // starts at the index before start line's min desired index, ie: min value for player's start index

        while (!startFound) {
            index++;

            let coords:number[][] = [trackCoordinates[index - 3], trackCoordinates[index - 2], trackCoordinates[index - 1], trackCoordinates[index], trackCoordinates[index + 1], trackCoordinates[index + 2]];


            if (coords[0][0] < coords[1][0] && coords[1][0] < coords[2][0] && coords[2][0] < coords[3][0] && coords[3][0] < coords[4][0] && coords[4][0] < coords[5][0]) { // want min 6 tile straight away for startof track
                startFound = true;
            }
            else if (coords[0][0] > coords[1][0] && coords[1][0] > coords[2][0] && coords[2][0] > coords[3][0] && coords[3][0] > coords[4][0] && coords[4][0] > coords[5][0]) {
                startFound = true;
            }
            else if (coords[0][1] < coords[1][1] && coords[1][1] < coords[2][1] && coords[2][1] < coords[3][1] && coords[3][1] < coords[4][1] && coords[4][1] < coords[5][1]) {
                startFound = true;
            }
            else if (coords[0][1] > coords[1][1] && coords[1][1] > coords[2][1] && coords[2][1] > coords[3][1] && coords[3][1] > coords[4][1] && coords[4][1] > coords[5][1]) {
                startFound = true;
            }

            if (startFound) {
                this.startIndex = index;
                this.startLine = trackCoordinates[index];
            }
        }

        return this.startIndex;
    }

    findStartLineCoord(trackCoordinates:number[][]) {
        if (this.startLine == null) {
            this.findStartIndex(trackCoordinates);
        }

        return this.startLine;
    }

    findStartTile(trackCoordinates:number[][]) {
        if (this.startLine == null) {
            this.findStartIndex(trackCoordinates);
        }

        if (trackCoordinates[this.startIndex - 1][0] < trackCoordinates[this.startIndex][0]) {
            this.startTile = this.isClockwise ? terrainArray.finish_left : terrainArray.finish_right;
        }
        else if (trackCoordinates[this.startIndex - 1][0] > trackCoordinates[this.startIndex][0]) {
            this.startTile = this.isClockwise ? terrainArray.finish_right : terrainArray.finish_left;
        }
        else if (trackCoordinates[this.startIndex - 1][1] < trackCoordinates[this.startIndex][1]) {
            this.startTile = this.isClockwise ? terrainArray.finish_down : terrainArray.finish_up;
        }
        else if (trackCoordinates[this.startIndex - 1][1] > trackCoordinates[this.startIndex][1]) {
            this.startTile = this.isClockwise ? terrainArray.finish_up : terrainArray.finish_down;
        }

        return this.startTile;
    }

    findPlayerStart(trackCoordinates:number[][]) {
        if (this.startLine == null) {
            this.findStartIndex(trackCoordinates);
        }

        return trackCoordinates[this.startIndex - 1];
    }

    // if calculated area using shoelace formula is negative, track is clockwise
    findTrackArea(trackCoordinates:number[][]) {
        let area:number = 0;
        let curr:number[];
        let next:number[];
    
        for (let i = 0; i < trackCoordinates.length; i++) {
            curr = trackCoordinates[i];
            next = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 1] : trackCoordinates[0];
            area += curr[0] *  next[1] - curr[1] *  next[0];
        }
    
        area /= 2;
        return area;
    }

}