import type ConfigData from "./ConfigData.js"
import terrainArray from "./TerrainArray.js"
// works in node, not on browser
import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"

export default class TrackGeneration {
    mapArray:number[][];
    firstPt:number[];
    startLine:number[];
    playerStartPt:number[];
    innerTrack:number[][];
    outerTrack:number[][];
    isClockwise:boolean;
    margin:number;
    borderWidth:number; // y
    borderHeight:number; // x
    numPts:number;
    mapHeight:number;
    mapWidth:number;
    minTrackLength:number;
    maxTrackLength:number;

    constructor(mapConfigData:ConfigData) {
        this.mapArray = [];
        this.firstPt = [];

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.1;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);
        this.numPts = 30;

        this.minTrackLength = 140;
        this.maxTrackLength = 250;
    }

    createMapArray() {
        // creating mapArray matrix
        let points:number[][] = this.generateRandomPoints();
        let convexHull:number[][] = this.findConvexHull(points);

        // this.findIfClockwiseTrack(convexHull);

        let numPtMoves:number = 3;
        let distVal:number = 10;
        for(let i = 0; i < numPtMoves; i++) {  
            convexHull = this.movePtsApart(convexHull, distVal);  
        } 

        //push apart again, so we can stabilize the points distances. 
        let adjustedConvexPts:number[][] = this.adjustConvexity(convexHull);

        numPtMoves = 3;
        distVal = 5;
        for(let i = 0; i < numPtMoves; i++) {  
            adjustedConvexPts = this.movePtsApart(adjustedConvexPts, distVal);  
        } 

        let fixedAnglePts:number[][] = adjustedConvexPts;

        numPtMoves = 1;
        for(let i = 0; i < numPtMoves; i++) {
            fixedAnglePts = this.fixTrackAngles(fixedAnglePts); 
            
            // adjustedPts = this.movePtsApart(adjustedPts);  
        }  

        let splinePts:number[][] = this.findSpline(fixedAnglePts);

        let trackCoordinates:number[][] = this.fillInTrack(splinePts);
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
            this.findIfClockwiseTrack(trackCoordinates);

            console.log("1st pt: ", this.firstPt);

            // fill in mapArray with grass tiles, then inner track with road tiles
            this.fillGrassTiles(trackCoordinates);
            this.placeTiles(trackCoordinates);
            
            // finding outer track, then filling mapArray with road tiles
            this.outerTrack = this.findOuterTrack(trackCoordinates);
            this.fillOuterMissingPoints(this.outerTrack);
        }
        // for (let i = 0; i < trackCoordinates.length; i++) {
        //         console.log("(", this.outerTrack[i][0], ", ", this.outerTrack[i][1], ")  --> ", i);
        // } 
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
        const concavityVal:number = 50;   // from 1 to inf, closer to 1: hugs shape more
        let convexHull:object[] = [];

        convexHull = hull(points, concavityVal);
        convexHull.pop();

        return convexHull as number[][];
    }

    movePtsApart(points:number[][], distVal:number) {  
        // let distVal:number = 10; //I found that 15 is a good value, though maybe, depending on your scale you'll need other value.  
        const maxDist:number = distVal ** 2;
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
        const minHeight:number = this.borderHeight;
        const minWidth:number = this.borderWidth;

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
        const difficulty:number = 0.5; //the closer the value is to 0, the harder the track should be 
        const maxDisp:number = 10;


        for(let i = 0; i < points.length; i++) {  
            let dispLen:number = (Math.random() ** difficulty) * maxDisp;  
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
            // adjustedPoints[i * 2 + 1][0] = ((adjustedPoints[i * 2 + 1][0] + (nextPt[0] % points.length)) / 2) + displacement[0];
            // adjustedPoints[i * 2 + 1][1] = ((adjustedPoints[i * 2 + 1][1] + (nextPt[1] % points.length)) / 2) + displacement[1];
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
        const angle:number = 95;
        // let prev = points[0];

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

            if(Math.abs(a * 180 / Math.PI) <= angle) continue;  

            let nA = angle * Math.sign(a) * Math.PI / 180;  
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
        // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        const alpha:number = 0.75;
        const ptsBtHull:number = 2;

        let splinePts:number[][] = [];

        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
        splinePts = catmulRomInterpolation(convexHull, alpha, ptsBtHull, true);
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

        // console.log("loop: ");
        // for (let i = 0; i < loop.length; i++) {
        //     console.log("(", loop[i][0], ", ", loop[i][1], ")");
        // }
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

    fillGrassTiles(trackCoordinates:number[][]) {
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

    placeTiles(trackCoordinates:number[][]) {
        let finish_placed:boolean = false;
        let prev:number[];
        let curr:number[];
        let next:number[];
        let prevprev:number[];
        let nextnext:number[];

        for (let i = 1; i < trackCoordinates.length; i++) {
            prevprev = (i == 1) ? trackCoordinates[trackCoordinates.length - 2] : trackCoordinates[i - 2];
            prev = trackCoordinates[i - 1];
            curr = trackCoordinates[i];
            next = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 1] : trackCoordinates[1];

            if (i < trackCoordinates.length - 2) {
                nextnext = trackCoordinates[i + 2];
            } else if (i == trackCoordinates.length - 2) {
                nextnext = trackCoordinates[1];
            } else {
                nextnext = trackCoordinates[2];
            }
            // nextnext = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 2] : trackCoordinates[2];

            // if (i < trackCoordinates.length - 1) {
            //     nextnext = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 2] : trackCoordinates[2];
            // }
            if (finish_placed == false && i > 1) {
                if (prevprev[0] < prev[0] && prev[0] < curr[0] && curr[0] < next[0] && next[0] < nextnext[0]) {
                    this.mapArray[curr[0]][curr[1]] = terrainArray.finish_right;
                    finish_placed = true;

                } else if (prevprev[0] > prev[0] && prev[0] > curr[0] && curr[0] > next[0] && next[0] > nextnext[0]) {
                    this.mapArray[curr[0]][curr[1]] = terrainArray.finish_left;
                    finish_placed = true;

                } else if (prevprev[1] < prev[1] && prev[1] < curr[1] && curr[1] < next[1] && next[1] < nextnext[1]) {
                    this.mapArray[curr[0]][curr[1]] = terrainArray.finish_up;
                    finish_placed = true;

                } else if (prevprev[1] > prev[1] && prev[1] > curr[1] && curr[1] > next[1] && next[1] > nextnext[1]) {
                    this.mapArray[curr[0]][curr[1]] = terrainArray.finish_down;
                    finish_placed = true;

                } else {
                    this.placeInnerTiles(prevprev, prev, curr, next, nextnext);
                }

                if (finish_placed == true) {
                    this.startLine = trackCoordinates[i];
                    if (this.isClockwise) {
                        this.playerStartPt = trackCoordinates[i + 1];
                        console.log("clockwise")
                    } else {
                        this.playerStartPt = trackCoordinates[i - 1];
                        console.log("counter clockwise")                    
                    }
                    console.log("start line: ", i);  
                    // console.log("prevprev", prevprev);
                    // console.log("prev", prev);
                    // console.log("curr", curr);
                    // console.log("next", next);
                    // console.log("nextnext", nextnext);
                }

            } else {
                this.placeInnerTiles(prevprev, prev, curr, next, nextnext);
            }
            
            prevprev = prev;
            prev = curr;
        }

        // replace i = 1 tile 
        this.placeInnerTiles(trackCoordinates[trackCoordinates.length - 2], trackCoordinates[0], trackCoordinates[1], trackCoordinates[2], trackCoordinates[3]);

    }

    findIfClockwiseTrack(trackCoordinates:number[][]) {
        let trackArea:number = this.findTrackArea(trackCoordinates);
        console.log("trackArea: ", trackArea);


        if (trackArea < 0) {
            this.isClockwise = true;
        } else {
            this.isClockwise = false;
        }
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

    placeInnerTiles(prevprev: number[], prev:number[], curr:number[], next:number[], nextnext:number[]) {
        let prev_array:number[] = [];

        // filling straight tiles
        if (prev[1] < curr[1] && curr[1] < next[1]) {
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

        // fill with dirt
        // else {
        //     this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NE;
        // }

        // if (prev[1] < curr[1] && next[0] > curr[0]) {
        //     if (prevprev[0] < prev[0]) {
        //         this.mapArray[prev[0]][prev[1]] = terrainArray.y_NE[0];
        //     } else {
        //         this.mapArray[prev[0]][prev[1]] = terrainArray.straight_up;
        //     }

        //     if (nextnext[0] > next[0]) {
        //         this.mapArray[curr[0]][curr[1]] = terrainArray.y_NE[2];
        //         this.mapArray[next[0]][next[1]] = terrainArray.y_NE[3];
        //     } else {
        //         this.mapArray[curr[0]][curr[1]] = terrainArray.diag_NE;
        //         this.mapArray[next[0]][next[1]] = terrainArray.corner_NE;
        //     }
        // }
    }

    findOuterTrack(trackCoordinates:number[][]) {
        let outerTrack:number[][] = [];
        let outerPt:number[] = [];

        let currPt:number[];
        let currInnerTile:number;
        let prevPt:number[];
        let prevInnerTile:number;
        let nextPt:number[];
        let nextInnerTile:number;
        
        // setting prevPt and firstInnerTile for first pt in trackCoordinates
        currPt = trackCoordinates[0];
        currInnerTile = this.mapArray[currPt[0]][currPt[1]];
        prevPt = trackCoordinates[trackCoordinates.length - 2];
        prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];
        nextPt = trackCoordinates[1];
        nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

        // setting first pt in outerTrack and the tile for the first outer pt in mapArray
        outerTrack.push(this.findOuterPt(currPt, currInnerTile, prevInnerTile, nextInnerTile));
        // outerTrack[0] = outerPt;
        console.log("1st outer pt: ", outerTrack[0]);

        for (let i = 1; i < trackCoordinates.length - 1; i++) {
            currPt = trackCoordinates[i];
            currInnerTile = this.mapArray[currPt[0]][currPt[1]];

            prevPt = trackCoordinates[i - 1];
            prevInnerTile = this.mapArray[prevPt[0]][prevPt[1]];

            nextPt = trackCoordinates[i + 1];
            nextInnerTile = this.mapArray[nextPt[0]][nextPt[1]];

            outerTrack.push(this.findOuterPt(currPt, currInnerTile, prevInnerTile, nextInnerTile));
        }

        // adding first pt to the end of outerTrack array to complete the loop
        outerTrack.push(outerTrack[0]);
        console.log("outer len", outerTrack.length)
        // let tempTrack:number[][] = this.fillInTrack(outerTrack);
        // console.log("o len", tempTrack.length)
        // for (let i = 0; i < trackCoordinates.length; i++) {
        //         console.log("(", outerPt[i][0], ", ", outerPt[i][1], ")  --> ", i);
        // } 

        // this.fillOuterMissingPoints(outerTrack);
        // console.log("outer len", outerTrack.length)

        return outerTrack;
    }

    findOuterPt(innerPt:number[], innerTile:number, prevInnerTile:number, nextInnerTile:number) {
        let tempPt:number[] = [];

        if (terrainArray.diagonals.includes(innerTile)) {
            if (innerTile == terrainArray.diag_NW) {
                tempPt = [innerPt[0] + 1, innerPt[1] + 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SE;
                // console.log("corner_SE");

            }
            else if (innerTile == terrainArray.diag_NE) {
                tempPt = [innerPt[0] + 1, innerPt[1] - 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SW;
                // console.log("corner_SW");

            }
            else if (innerTile == terrainArray.diag_SE) {
                tempPt = [innerPt[0] - 1, innerPt[1] - 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NW;
                // console.log("corner_NW");

            }
            else if (innerTile == terrainArray.diag_SW) {
                tempPt = [innerPt[0] - 1, innerPt[1] + 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NE;
                // console.log("corner_NE");

            }
        }
        else if (terrainArray.corners.includes(innerTile)) {
            if (innerTile == terrainArray.corner_NW) {
                tempPt = [innerPt[0] + 1, innerPt[1] + 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_SE;
                // console.log("diag_SE");

            }
            else if (innerTile == terrainArray.corner_NE) {
                tempPt = [innerPt[0] + 1, innerPt[1] - 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_SW;
                // console.log("diag_SW");

            }
            else if (innerTile == terrainArray.corner_SE) {
                tempPt = [innerPt[0] - 1, innerPt[1] - 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_NW;
                // console.log("diag_NW");

            }
            else if (innerTile == terrainArray.corner_SW) {
                tempPt = [innerPt[0] - 1, innerPt[1] + 1];
                this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.diag_NE;
                // console.log("diag_NE");

            }
        }
        else if (terrainArray.straights.includes(innerTile) || terrainArray.finishes.includes(innerTile)) {
            if (innerTile == terrainArray.straight_up || innerTile == terrainArray.finish_up) {
                tempPt = [innerPt[0] + 1, innerPt[1]];

                if (prevInnerTile == terrainArray.diag_NW) {
                    this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SE;
                    // console.log("corner_SE");
                } 
                else {
                    this.mapArray[tempPt[0]][tempPt[1]] = (innerTile == terrainArray.straight_up) ? terrainArray.straight_down : terrainArray.finish_down;
                    // console.log("down");
                }

            }
            else if (innerTile == terrainArray.straight_down || innerTile == terrainArray.finish_down) {
                tempPt = [innerPt[0] - 1, innerPt[1]];

                if (prevInnerTile == terrainArray.diag_SE) {
                    this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NW;
                    // console.log("corner_NW");
                } 
                else {
                    this.mapArray[tempPt[0]][tempPt[1]] =  (innerTile == terrainArray.straight_down) ? terrainArray.straight_up : terrainArray.finish_up;
                    // console.log("up");
                }

            }
            else if (innerTile == terrainArray.straight_left || innerTile == terrainArray.finish_left) {
                tempPt = [innerPt[0], innerPt[1] + 1];

                if (prevInnerTile == terrainArray.diag_SW) {
                    this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_NE;
                    // console.log("corner_NE");

                } 
                else {
                    this.mapArray[tempPt[0]][tempPt[1]] = (innerTile == terrainArray.straight_left) ? terrainArray.straight_right : terrainArray.finish_right;
                    // console.log("right");
                }

            }
            else if (innerTile == terrainArray.straight_right || innerTile == terrainArray.finish_right) {
                tempPt = [innerPt[0], innerPt[1] - 1];

                // if (!terrainArray.diagonals.includes(prevTile)) {
                if (prevInnerTile == terrainArray.diag_NE) {
                    this.mapArray[tempPt[0]][tempPt[1]] = terrainArray.corner_SW;
                    // console.log("corner_SW");
                } 
                else {
                    this.mapArray[tempPt[0]][tempPt[1]] =  (innerTile == terrainArray.straight_right) ? terrainArray.straight_left : terrainArray.finish_left;
                    // console.log("left");   
                }
            }
        }

        // outerTrack.push(tempPt);
        return tempPt;
    }

    fillOuterMissingPoints(outerTrack:number[][]) {
        let currPt:number[];
        let currTile:number;
        let nextPt:number[];
        let nextTile:number;
        let btwnPt:number[];
        let btwnTile:number;
        let diff:number;

        console.log('outer')

        for (let i = 0; i < outerTrack.length - 1; i++) {
            currPt = outerTrack[i];
            currTile = this.mapArray[currPt[0]][currPt[1]];
            nextPt = outerTrack[i + 1];
            nextTile = this.mapArray[nextPt[0]][nextPt[1]];

            if (i > outerTrack.length - 1) {
                continue;
            }

            // difference between coordinates of two consecutive points
            diff = Math.abs(currPt[0] - nextPt[0]) + Math.abs(currPt[1] - nextPt[1]);

            if (diff > 2) {
                console.log("Looooooong")
                console.log("i", i)
                console.log('curr', currPt)
                console.log('next', nextPt)
                console.log('diff', diff)

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

                } else { // if couunter clockwise
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
                outerTrack.splice(i + 1, 0, btwnPt);
                this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
                console.log("len", outerTrack.length)
            }

            if (diff == 2) {    // ie if points are not next to each other
                console.log("i", i)
                console.log('curr', currPt, currTile)
                console.log('next', nextPt, nextTile)
                console.log('diff', diff)
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
                        if (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_SW || nextTile == terrainArray.diag_SW) {
                            btwnTile = terrainArray.diag_NW;
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
                            btwnTile = (nextTile == terrainArray.diag_NW || nextTile == terrainArray.corner_NE) ? terrainArray.diag_NW : terrainArray.straight_down;
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
                                btwnTile = (nextTile == terrainArray.diag_NW ||  terrainArray.corner_SW) ? terrainArray.diag_NE : terrainArray.straight_up;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_NE ||  terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_up;
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
                                btwnTile = (nextTile == terrainArray.diag_SW ||  terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_down;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_SE ||  terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_down;
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
                                btwnTile = (nextTile == terrainArray.diag_NW ||  terrainArray.corner_NE) ? terrainArray.diag_SW : terrainArray.straight_left;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_SW ||  terrainArray.corner_SE) ? terrainArray.diag_NW : terrainArray.straight_left;
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
                                btwnTile = (nextTile == terrainArray.diag_SE ||  terrainArray.corner_SW) ? terrainArray.diag_NE : terrainArray.straight_right;
                            }
                            else {
                                btwnTile = (nextTile == terrainArray.diag_NE ||  terrainArray.corner_NW) ? terrainArray.diag_SE : terrainArray.straight_right;
                            }
                            btwnPt = (currPt[0] < nextPt[0]) ? [currPt[0] + 1, currPt[1]] : [currPt[0] - 1, currPt[1]];
                        }
                        else if (currPt[0] == nextPt[0]) {
                            if (currPt[1] < nextPt[1]) {
                                if (nextTile == terrainArray.diag_SE ||  terrainArray.corner_SW || nextTile == terrainArray.straight_down) {
                                    btwnTile = terrainArray.diag_SW;
                                }
                                else if (nextTile == terrainArray.diag_NE ||  terrainArray.corner_NW || nextTile == terrainArray.straight_up) {
                                    btwnTile = terrainArray.diag_NW;
                                    btwnPt = [currPt[0], currPt[1] + 1];
                                }
                            } 
                            // else {

                            // }
                            // btwnTile = terrainArray.diag_SW;
                            // btwnPt = [currPt[0], currPt[1] + 1];
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
                outerTrack.splice(i + 1, 0, btwnPt);
                this.mapArray[btwnPt[0]][btwnPt[1]] = btwnTile;
                console.log("len", outerTrack.length)
                // i--; //??? i++??
            }
        }
        console.log('outer')
    }

}