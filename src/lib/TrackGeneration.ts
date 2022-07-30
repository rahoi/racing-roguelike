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
            console.log("player start: ", this.playerStartPt);

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
}
