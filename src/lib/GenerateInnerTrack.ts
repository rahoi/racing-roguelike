import type {coordinate} from "./coordinateType"
import type ConfigData from "./ConfigData"
import terrainArray from "./TerrainArray"

import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"


export default class GenerateInnerTrack {
    innerTrack:number[][];  // array of inner track points, innerTrack[i][0] corresponds to the height on the Phaser game screen, innerTrack[i][1] corresponds to the width
    startLinePt:number[];    // coordinate of start line
    startIndexBeforeOffset:number;  // index of start line in inner track before offsetting inner track so start line is at index 1
    innerStartTile:number;  // tile at start line
    playerStartPt:number[]; // coordinate of the player's starting point
    isClockwise:boolean;    // true if innerTrack runs clockwise
    trackNeighborMap:Map<string, coordinate>;   // map of each track point's track neighbors
    
    // constants for generating track, sent in as param in constructor
    numPts:number; // number of random points to generate for initial track generation

    mapHeight:number;
    mapWidth:number;

    margin:number;  // percentage of map dimension to calculate border
    borderWidth:number; // buffer around sides of game screen
    borderHeight:number;    // buffer around top and bottom of game screen

    ptAdjustScale:number;   // value to scale the difference between min/max height/width and the coordinate height/width

    concavityVal:number;    // used to calculate convex hull, from 1 to inf, closer to 1: hugs shape more

    convexityDifficulty:number; // used to adjust track convexity, the closer the value is to 0, the harder the track should be 
    convexityDisp:number;   // used to adjust track convexity, maximum point displacement

    trackAngle:number;  // desired minimum angle between track points, in degrees

    splineAlpha:number; // used in catmull rom interpolation, from 0 to 1 (exclusive), centripedal:  0.5, chordal (more rounded): 1
    splinePtsBtHull:number; // number of points to add between track points to smoothen shape

    minTrackLength:number;  // minimum track length
    maxTrackLength:number;  // maximum track length

    constructor(numPts:number, margin:number, ptAdjustScale:number, concavityVal:number, convexityDifficulty:number, convexityDisp:number, trackAngle:number, 
        splineAlpha:number, splinePtsBtHull:number, minTrackLength:number, maxTrackLength:number, mapConfigData:ConfigData) {
        this.numPts = numPts;

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = margin;   // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);

        // constants used in helper functions passed in from instantiation
        this.ptAdjustScale = ptAdjustScale;

        this.concavityVal = concavityVal;   // from 1 to inf, closer to 1: hugs shape more

        this.convexityDifficulty = convexityDifficulty; //the closer the value is to 0, the harder the track should be 
        this.convexityDisp = convexityDisp;

        this.trackAngle = trackAngle;   // in degrees

        this.splineAlpha = splineAlpha; // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        this.splinePtsBtHull = splinePtsBtHull;

        this.minTrackLength = minTrackLength;
        this.maxTrackLength = maxTrackLength;
    }

    // main function to generate the inner race track points 
    generateInnnerRaceTrack() {
        // generate random points
        let randomPoints:number[][] = this.#generateRandomPoints(this.numPts, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth);

        // finding the convex hull of the generated points
        let convexHull:number[][] = this.#findConvexHull(randomPoints, this.concavityVal);

        // push points in the inner track array, so we can stabilize the points distances 
        let numPtMoves:number = 3;
        let distVal:number = 7;
        for(let i = 0; i < numPtMoves; i++) {  
            convexHull = this.#movePtsApart(convexHull, distVal, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth, this.ptAdjustScale);  
        } 

        // adjust convexity of track by adding points between current track points
        let adjustedConvexPts:number[][] = this.#adjustConvexity(convexHull, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth, this.ptAdjustScale)
        for(let i = 0; i < numPtMoves; i++) {  
            adjustedConvexPts = this.#movePtsApart(adjustedConvexPts, distVal, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth, this.ptAdjustScale);  
        }

        // fix the angles between points closer to this.trackAngle
        let fixedAnglePts:number[][] = adjustedConvexPts;
        for(let i = 0; i < numPtMoves; i++) {
            fixedAnglePts = this.#fixTrackAngles(adjustedConvexPts, this.trackAngle, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth, this.ptAdjustScale); 
            fixedAnglePts = this.#movePtsApart(fixedAnglePts, distVal, this.mapHeight, this.mapWidth, this.borderHeight, this.borderWidth, this.ptAdjustScale);  
        }  

        // smoothens out the inner track array using catmull rom interpolation
        let splinePts:number[][] = this.#findSpline(fixedAnglePts, this.splineAlpha, this.splinePtsBtHull);

        // fills in the missing points in the inner track array
        let innerTrack:number[][] = this.#fillInTrack(splinePts);

        if (innerTrack.length < this.minTrackLength) {
            this.generateInnnerRaceTrack();
        } else {
            this.isClockwise = this.#findIfClockwiseTrack(innerTrack);

            this.startIndexBeforeOffset = this.#findStartIndexBeforeOffset(innerTrack);
            
            this.startLinePt = this.#findStartLineCoord(innerTrack, this.startIndexBeforeOffset);
            this.innerStartTile = this.#findStartTile(innerTrack, this.startIndexBeforeOffset, this.isClockwise);
            this.playerStartPt = this.#findPlayerStart(innerTrack, this.startIndexBeforeOffset);

            innerTrack = this.#offsetInnerTrack(innerTrack, this.startIndexBeforeOffset);
        }

        this.innerTrack = innerTrack;
        return innerTrack;
    }

    getIsClockwise() {
        return this.isClockwise;
    }

    // after offsetting inner track, start line is at index 1
    getStartLineIndex() {
        return 1;
    }

    getStartLineCoord() {
        return this.startLinePt;
    }

    getStartTile() {
        return this.innerStartTile;
    }

    getPlayerStart() {
        return this.playerStartPt;
    }

    // ----------------------------------Priavte helper functions----------------------------------
    #generateRandomPoints(numPts:number, mapHeight:number, mapWidth:number, borderHeight:number, borderWidth:number) {
        // generating random points
        let points:number[][] = [];

        for (let i = 0; i < numPts; i++) {
            let temp:number[] = [];
            temp[0] = Math.random() * (mapHeight - 2 * borderHeight) + borderHeight;
            temp[1] = Math.random() * (mapWidth - 2 * borderWidth) + borderWidth;

            points.push(temp);
        }

        return points;
    }

    #findConvexHull(trackCoordinates:number[][], concavityVal:number) {
        // calculating convex hull points
        let convexHull:object[] = [];

        convexHull = hull(trackCoordinates, concavityVal);
        convexHull.pop();

        return convexHull as number[][];
    }

    #movePtsApart(trackCoordinates:number[][], distVal:number, mapHeight:number, mapWidth:number, borderHeight:number, borderWidth:number, ptAdjustScale:number) {  
        // let distVal:number = 10; 
        let maxDist:number = distVal ** 2;
        let distBtPts:number;

        for (let i = 0; i < trackCoordinates.length; i++) {
            for (let j = i + 1; j < trackCoordinates.length; ++j) {
                distBtPts = ((trackCoordinates[j][0] - trackCoordinates[i][0]) ** 2) + ((trackCoordinates[j][1] - trackCoordinates[i][1]) ** 2);

                // console.log("dist",distSq)
                if (distBtPts < maxDist) {
                    let dx = trackCoordinates[j][0] - trackCoordinates[i][0];
                    let dy = trackCoordinates[j][1] - trackCoordinates[i][1];
                    let dl = Math.sqrt(dx ** 2 + dy ** 2);
                    dx /= dl;
                    dy /= dl;
                    let diff = distVal - dl;
                    dx *= diff;
                    dy *= diff;
                    trackCoordinates[j][0] += dx;
                    trackCoordinates[j][1] += dy; 
                    trackCoordinates[i][0] -= dx;
                    trackCoordinates[i][1] -= dy; 

                    trackCoordinates[i] = this.#checkPtWithinBorder(trackCoordinates[i], mapHeight, mapWidth, borderHeight, borderWidth, ptAdjustScale);
                    trackCoordinates[j] = this.#checkPtWithinBorder(trackCoordinates[j], mapHeight, mapWidth, borderHeight, borderWidth, ptAdjustScale);
                }
            }
        }

        return trackCoordinates;
    }

    // ptAdjustScale: value to scale the difference between min/max height/width and the coordinate height/width
    #checkPtWithinBorder(coordinate:number[], mapHeight:number, mapWidth:number, borderHeight:number, borderWidth:number, ptAdjustScale:number) {
        let minHeight:number = borderHeight;
        let minWidth:number = borderWidth;

        // if less than border
        coordinate[0] = (coordinate[0] < minHeight) ? (minHeight + (coordinate[0] - minHeight) * ptAdjustScale) : coordinate[0];
        coordinate[1] = (coordinate[1] < minWidth) ? (minWidth + (coordinate[1] - minWidth) * ptAdjustScale) : coordinate[1];

        // if greater than border
        let maxHeight:number = mapHeight - borderHeight;
        let maxWidth:number = mapWidth - borderWidth;

        coordinate[0] = (coordinate[0] > maxHeight) ? (maxHeight - (coordinate[0] - maxHeight) * ptAdjustScale) : coordinate[0];
        coordinate[1] = (coordinate[1] > maxWidth) ? (maxWidth - (coordinate[1] - maxWidth) * ptAdjustScale) : coordinate[1];

        return coordinate;
    }

    #adjustConvexity(trackCoordinates:number[][], mapHeight:number, mapWidth:number, borderHeight:number, borderWidth:number, ptAdjustScale:number) {
        let adjustedPoints:number[][] = [];  
        let displacement:number[] = [];  


        for(let i = 0; i < trackCoordinates.length; i++) {  
            let dispLen:number = (Math.random() ** this.convexityDifficulty) * this.convexityDisp;
            // displacement = [0, 1];
            displacement = [Math.random(), Math.random()];

            let rotation = (Math.random() * 360) * Math.PI / 180
            displacement = this.#rotatePt(displacement, rotation);
            displacement[0] *= dispLen
            displacement[1] *= dispLen

            adjustedPoints[i * 2] = trackCoordinates[i];  
            adjustedPoints[i * 2 + 1] = trackCoordinates[i];  
      
            let nextPt:number[];
            nextPt = i < trackCoordinates.length - 1 ? trackCoordinates[i + 1] : trackCoordinates[0];

            let temp:number[] = [];
            // midpoint calculation
            temp[0] = (adjustedPoints[i * 2 + 1][0] + nextPt[0]) / 2 + displacement[0];
            temp[1] = (adjustedPoints[i * 2 + 1][1] + nextPt[1]) / 2 + displacement[1];

            temp = this.#checkPtWithinBorder(temp, mapHeight, mapWidth, borderHeight, borderWidth, ptAdjustScale);

            adjustedPoints[i * 2 + 1] = temp;
        }

        return adjustedPoints;
    }

    #rotatePt(point:number[], radians:number) {
        let cos = Math.cos(radians);
		let sin = Math.sin(radians);

		let x = point[0] * cos - point[1] * sin;
		let y = point[0] * sin + point[1] * cos;

		point[0] = x;
		point[1] = y;

        return point;
    }

    // desiredAngle in degrees
    #fixTrackAngles(trackCoordinates:number[][], desiredAngle:number, mapHeight:number, mapWidth:number, borderHeight:number, borderWidth:number, ptAdjustScale:number) {
        for(let i = 0; i < trackCoordinates.length; i++) {  
            let prev:number = (i - 1 < 0) ? trackCoordinates.length - 1 : i - 1;  
            let next:number = (i + 1) % trackCoordinates.length;

            // normalizing the vector from current (i) point to previous point
            let prevX:number = trackCoordinates[i][0] - trackCoordinates[prev][0];  
            let prevY:number = trackCoordinates[i][1] - trackCoordinates[prev][1];  
            let distaneToPrev:number = Math.sqrt(prevX ** 2 + prevY ** 2);  
            prevX /= distaneToPrev;  
            prevY /= distaneToPrev;  
            
            // normalizing the vector from current (i) point to next point
            let nextX:number = -(trackCoordinates[i][0] - trackCoordinates[next][0]);
            let nextY:number = -(trackCoordinates[i][1] - trackCoordinates[next][1]);
            let distanceToNext:number = Math.sqrt(nextX ** 2 + nextY ** 2);  
            nextX /= distanceToNext;  
            nextY /= distanceToNext;  

            // calculating angle in radians between vectors using atan2 of the perpendicular cross product and dot product
            let angle:number = Math.atan2((prevX * nextY - prevY * nextX), (prevX * nextX + prevY * nextY));  

            // exits function if the angle between the vectors is at least desiredAngle
            if(Math.abs(angle * 180 / Math.PI) <= desiredAngle) continue;  


            let nA = desiredAngle * Math.sign(angle) * Math.PI / 180;  
            let diff = nA - angle;  // in radians

            // let newNextPt:number[] = this.rotatePt(points[next], diff);
            // points[next][0] = points[i][0] + newX;  
            // points[next][1] = points[i][1] + newY;  
            let cos = Math.cos(diff);  
            let sin = Math.sin(diff);  
            let newX = nextX * cos - nextY * sin;  
            let newY = nextX * sin + nextY * cos;  
            newX *= distanceToNext;  
            newY *= distanceToNext;  
            trackCoordinates[next][0] = trackCoordinates[i][0] + newX;  
            trackCoordinates[next][1] = trackCoordinates[i][1] + newY;  

            // if less than 0
            trackCoordinates[next] = this.#checkPtWithinBorder(trackCoordinates[next], mapHeight, mapWidth, borderHeight, borderWidth, ptAdjustScale);
        }

        return trackCoordinates;
    }

    #findSpline(trackCoordinates:number[][], splineAlpha:number, splinePtsBtHull:number) {
        // calculating catmull rom spline points
        let splinePts:number[][] = [];
        let ptCount = 0;

        splinePts = catmulRomInterpolation(trackCoordinates, splineAlpha, splinePtsBtHull, true);
        // splinePts = catmulRomInterpolation(convexHull, this.splineAlpha, this.splinePtsBtHull, true);
        // splinePts = catmulRomInterpolation(convexHull, this.splineAlpha, this.splinePtsBtHull, true);

        for (let i = 0; i < splinePts.length; i++) {
            splinePts[i][0] = Math.trunc(splinePts[i][0]);
            splinePts[i][1] = Math.trunc(splinePts[i][1]);
        }
        // add the first pt in the track to the back to complete the loop
        splinePts.push([splinePts[0][0], splinePts[0][1]]);

        return splinePts;
    }

    #fillInTrack(trackCoordinates:number[][]) {
        // filling in polygon
        // let trackCoordinates:number[][] = splinePts;
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

            if (xDiff != 0) { 
                // if curr height smaller
                // console.log("xdiff")
                // console.log(prevPt, trackCoordinates[i])
                tempPt = (prevPt[0] > trackCoordinates[i][0]) ? [prevPt[0] - 1, prevPt[1]] : [prevPt[0] + 1, prevPt[1]];

                if (tempPt == trackCoordinates[prevPrevInd]) {
                    tempPt[0] = trackCoordinates[i][0];
                    tempPt[1] = prevPt[1];
                }
                trackCoordinates.splice(i, 0, tempPt);

                xDiff = Math.abs(prevPt[0] - trackCoordinates[i][0]);
                yDiff = Math.abs(prevPt[1] - trackCoordinates[i][1]);
            }
            else if (yDiff != 0) {
                // console.log("ydiff")
                tempPt = (prevPt[1] > trackCoordinates[i][1]) ? [prevPt[0], prevPt[1] - 1] : tempPt = [prevPt[0], prevPt[1] + 1]; // if curr width smaller
                trackCoordinates.splice(i, 0, tempPt);

            }

            prevPrevInd++;
            prevPt = trackCoordinates[i];
        }

        let track = this.#removeLoops(trackCoordinates);
        // let track = this.removeSnaking(tempTrack);

        return track;
    }

    #removeLoops(trackCoordinates:number[][]) {
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

    #findIfClockwiseTrack(trackCoordinates:number[][]) {
        // area created by enclosed race track loop
        let trackArea:number = this.#findTrackArea(trackCoordinates);

        // if the calculated area is negative, the track runs clockwises
        let isClockwise = (trackArea < 0) ? true : false;
        return isClockwise;
    }

    #findStartIndexBeforeOffset(trackCoordinates:number[][]) {
        let startFound:boolean = false;
        // let index:number = 2; // starts at the index before start line's min desired index, ie: min value for player's start index
        let startStraightTiles:number = 6; // min number of tiles for start lane straight away
        let startIndex = -1;

        for (let i = 0; i < trackCoordinates.length - 2; i++) {
            let coords:number[][] = [];

            for (let j = 0; j < startStraightTiles; j++) {
                let index:number = (i + j) % (trackCoordinates.length - 2);
                coords.push(trackCoordinates[index]);
            }
            // let index1:number = i % (trackCoordinates.length - 2);
            // let index2:number = (i + 1) % (trackCoordinates.length - 2);
            // let index3:number = (i + 2) % (trackCoordinates.length - 2);
            // let index4:number = (i + 3) % (trackCoordinates.length - 2);
            // let index5:number = (i + 4) % (trackCoordinates.length - 2);
            // let index6:number = (i + 5) % (trackCoordinates.length - 2);

            // coords = [trackCoordinates[index1], trackCoordinates[index2], trackCoordinates[index3], trackCoordinates[index4], trackCoordinates[index5], trackCoordinates[index6]];

            // want min 6 tile straight away for startof track
            if (coords[0][0] < coords[1][0] && coords[1][0] < coords[2][0] && coords[2][0] < coords[3][0] && coords[3][0] < coords[4][0] && coords[4][0] < coords[5][0]) { 
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
                startIndex = i + 2;
                break;
                // this.startLine = trackCoordinates[index];
            }
        }

        return startIndex;
    }

    //
    #findStartLineCoord(trackCoordinates:number[][], startIndexBeforeOffset:number) {
        return trackCoordinates[startIndexBeforeOffset];
    }

    #findStartTile(trackCoordinates:number[][], startIndex:number, isClockwise:boolean) {
        let startTile:number = -1;

        if (trackCoordinates[startIndex - 1][0] < trackCoordinates[startIndex][0]) {
            startTile = isClockwise ? terrainArray.finish_left : terrainArray.finish_right;
        }
        else if (trackCoordinates[startIndex - 1][0] > trackCoordinates[startIndex][0]) {
            startTile = isClockwise ? terrainArray.finish_right : terrainArray.finish_left;
        }
        else if (trackCoordinates[startIndex - 1][1] < trackCoordinates[startIndex][1]) {
            startTile = isClockwise ? terrainArray.finish_down : terrainArray.finish_up;
        }
        else if (trackCoordinates[startIndex - 1][1] > trackCoordinates[startIndex][1]) {
            startTile = isClockwise ? terrainArray.finish_up : terrainArray.finish_down;
        }

        return startTile;
    }

    #findPlayerStart(trackCoordinates:number[][], startIndexBeforeOffset:number) {
        return trackCoordinates[startIndexBeforeOffset - 1];
    }

    // if calculated area using shoelace formula is negative, track is clockwise
    #findTrackArea(trackCoordinates:number[][]) {
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

    // offsets inner track so start line tile is at index 1, and player start tile is index 0
    #offsetInnerTrack(innerTrack:number[][], startIndexBeforeOffset:number) {
        // let newInnerTrack:number[][] = [...innerTrack.slice(startIndexBeforeOffset - 1), ...innerTrack.slice(0, startIndexBeforeOffset - 1)];
        let newInnerTrack:number[][] = [...innerTrack.slice(startIndexBeforeOffset - 1, innerTrack.length - 1), ...innerTrack.slice(0, startIndexBeforeOffset - 1), innerTrack[startIndexBeforeOffset - 1]];

        return newInnerTrack;
    }

}