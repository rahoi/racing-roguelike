import type ConfigData from "./ConfigData"
import terrainArray from "./TerrainArray"
import PlaceTrackTiles from "./PlaceTrackTiles"
import GenerateInnerTrack from "./GenerateInnerTrack"

export default class TrackGeneration {
    mapArray:number[][];    // stores all tile values for tile map
    innerTrack:number[][];  // array of inner track points, innerTrack[i][0] corresponds to the height on the Phaser game screen, innerTrack[i][1] corresponds to the width
    outerTrack:number[][];  // array of outer track points

    firstInnerPt:number[];   // first point in inner track array
    startIndex:number;  // index of start line in inner track array
    startLine:number[]; // coordinate of start line
    startTile:number;   // tile at start line
    playerStartPt:number[]; // coordinate of the player's starting point
    isClockwise:boolean;    // true if innerTrack runs clockwise
    placeTrackTiles:PlaceTrackTiles;
    generateInnerTrack:GenerateInnerTrack;

    // constants for generating track
    numPts:number;  // number of random points to generate for initial track generation

    mapHeight:number;
    mapWidth:number;
    margin:number;  // percentage of map dimension to calculate border
    borderWidth:number; // buffer around sides of game screen
    borderHeight:number; // buffer around top and bottom of game screen

    ptAdjustScale:number;  // value to scale the difference between min/max height/width and the coordinate height/width

    concavityVal:number;   // used to calculate convex hull, from 1 to inf, closer to 1: hugs shape more

    convexityDifficulty:number; // used to adjust track convexity, the closer the value is to 0, the harder the track should be 
    convexityDisp:number;   // used to adjust track convexity, maximum point displacement

    trackAngle:number;  // in degrees

    splineAlpha:number; // used in catmull rom interpolation, from 0 to 1, centripedal:  0.5, chordal (more rounded): 1
    splinePtsBtHull:number; // number of points to add between track points to smoothen shape

    minTrackLength:number;  // minimum track length
    maxTrackLength:number;  // maximum track length

    constructor(mapConfigData:ConfigData) {
        this.mapArray = [];
        this.firstInnerPt = [];

        this.numPts = 50;

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.2;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);

        this.ptAdjustScale = 0.25;

        this.concavityVal = 50;

        this.convexityDifficulty = 0.5;
        this.convexityDisp = 10;

        this.trackAngle = 95; // in degrees

        this.splineAlpha = 0.75;
        this.splinePtsBtHull = 2;

        this.minTrackLength = 150;
        this.maxTrackLength = 250;

        this.generateInnerTrack = new GenerateInnerTrack(this.numPts, this.margin, this.ptAdjustScale, this.concavityVal, this.convexityDifficulty, this.convexityDisp, this.trackAngle, this.splineAlpha, this.splinePtsBtHull, this.minTrackLength, this.maxTrackLength, mapConfigData);
    }

    createMapArray() {
        this.innerTrack = this.generateInnerTrack.generateInnnerRaceTrack();

        if (this.innerTrack.length < this.minTrackLength || this.innerTrack.length > this.maxTrackLength) {
            this.mapArray = [];
            this.innerTrack = [];
            // clockwiseTrack;
            this.createMapArray();
        } else {
            this.firstInnerPt = this.innerTrack[0];
            this.innerTrack = this.innerTrack;
            this.isClockwise = this.generateInnerTrack.findIfClockwiseTrack(this.innerTrack);
            this.startIndex = this.generateInnerTrack.findStartIndex(this.innerTrack);
            this.startLine = this.generateInnerTrack.findStartLineCoord(this.innerTrack);
            this.startTile = this.generateInnerTrack.findStartTile(this.innerTrack);
            this.playerStartPt = this.generateInnerTrack.findPlayerStart(this.innerTrack);

            console.log("1st pt: ", this.firstInnerPt);
            console.log("player start: ", this.playerStartPt);

            // fill in mapArray with grass tiles, then inner track with road tiles
            this.placeTrackTiles = new PlaceTrackTiles(this.mapArray, this.innerTrack, this.mapHeight, this.mapWidth, this.isClockwise, this.startIndex, this.startTile);

            this.mapArray = this.placeTrackTiles.fillTrackTiles();
        }

    }
}
