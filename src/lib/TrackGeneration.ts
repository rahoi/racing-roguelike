import type {coordinate} from "./coordinateType"
import type ConfigData from "./ConfigData"
import terrainArray from "./TerrainArray"
import PlaceTrackTiles from "./PlaceTrackTiles"
import GenerateInnerTrack from "./GenerateInnerTrack"

export default class TrackGeneration {
    mapArray:number[][];    // stores all tile values for tile map
    innerTrack:number[][];  // array of inner track points, innerTrack[i][0] corresponds to the height on the Phaser game screen, innerTrack[i][1] corresponds to the width
    outerTrack:number[][];  // array of outer track points
    neighborMap:Map<string, coordinate>;    // map of each track point's track neighbors
    allTrackPoints:number[][];  // array of all track points in the track
    outerRim:number[][];    // array of outer track tiles along the outer rim of the race track

    innerStartLineIndex:number;  // index of start line in inner track array
    innerStartLinePt:number[]; // coordinate of start line on the inner track
    innerStartTile:number;   // tile at inner start line
    
    outerStartLinePt:number[]; // coordinate of start line on the outer track
    outerStartTile:number;  // tile at outer start line
    
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
    innerBoundsSize:number;

    ptAdjustScale:number;  // value to scale the difference between min/max height/width and the coordinate height/width

    concavityVal:number;   // used to calculate convex hull, from 1 to inf, closer to 1: hugs shape more

    convexityDifficulty:number; // used to adjust track convexity, the closer the value is to 0, the harder the track should be 
    convexityDisp:number;   // used to adjust track convexity, maximum point displacement

    trackAngle:number;  // desired minimum angle between track points, in degrees

    splineAlpha:number; // used in catmull rom interpolation, from 0 to 1 (exclusive), centripedal:  0.5, chordal (more rounded): 1
    splinePtsBtHull:number; // number of points to add between track points to smoothen shape

    minTrackLength:number;  // minimum track length
    maxTrackLength:number;  // maximum track length

    constructor(mapConfigData:ConfigData) {
        this.mapArray = [];
        // this.firstInnerPt = [];

        this.numPts = 20;

        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        this.margin = 0.18;  // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);
        this.innerBoundsSize = 3 // 2 tile buffer for the edges of the map, and 1 tile buffer for the outer track

        this.ptAdjustScale = 0.325;

        this.concavityVal = 80;

        this.convexityDifficulty = 0.25;
        this.convexityDisp = 12;

        this.trackAngle = 110; // in degrees

        this.splineAlpha = 0.99;
        this.splinePtsBtHull = 1;

        this.minTrackLength = 150;
        this.maxTrackLength = 250;

        this.generateInnerTrack = new GenerateInnerTrack(this.numPts, this.margin, this.ptAdjustScale, this.concavityVal, this.convexityDifficulty, this.convexityDisp, this.trackAngle, this.splineAlpha, this.splinePtsBtHull, this.minTrackLength, this.maxTrackLength, mapConfigData);
    }

    createMapArray() {
        this.innerTrack = this.generateInnerTrack.generateInnnerRaceTrack();

        let innerBoundsCheck = this.#checkInnerTrackBounds(this.innerTrack, this.innerBoundsSize, this.mapHeight, this.mapWidth);

        // regenerates inner track if current inner track is shorter than the min length, longer than the max length, 
        // or its points are outside of the map's inner track bounds buffer
        if (this.innerTrack.length < this.minTrackLength || this.innerTrack.length > this.maxTrackLength || innerBoundsCheck) {
            this.mapArray = [];
            this.innerTrack = [];
            // clockwiseTrack;
            this.createMapArray();
        
        } else {
            // populates map data from the generated inner track
            this.innerTrack = this.innerTrack;
            this.isClockwise = this.generateInnerTrack.getIsClockwise();
            this.innerStartLineIndex = this.generateInnerTrack.getStartLineIndex();
            this.innerStartLinePt = this.generateInnerTrack.getStartLineCoord();
            this.innerStartTile = this.generateInnerTrack.getStartTile();
            this.playerStartPt = this.generateInnerTrack.getPlayerStart();

            // fill in mapArray with grass tiles, then inner track with road tiles
            this.placeTrackTiles = new PlaceTrackTiles(this.innerTrack, this.mapHeight, this.mapWidth, this.isClockwise, this.innerStartLineIndex, this.innerStartTile);

            this.mapArray = this.placeTrackTiles.fillTrackTiles();
            this.neighborMap = this.placeTrackTiles.getNeighborMap();
            this.allTrackPoints = this.placeTrackTiles.getAllTrackPts();
            this.outerRim = this.placeTrackTiles.getOuterRim();
            
            this.outerStartLinePt = this.placeTrackTiles.getOuterStartLineCoord();
            this.outerStartTile = this.placeTrackTiles.getOuterStartTile();

            // finds if there a long, narrow offshoots
            // ie: where a two adjacent points both only have two neighbors in the rest of the track points
            let offshoots:boolean = this.#checkNarrowOffshoots(this.neighborMap);

            // finds if outer rim ever doubles back on itself
            let doublesBack:boolean = this.#checkDoublingBack(this.outerRim);

            // regenerates map if there are any offshoots or doubling back
            if (doublesBack || offshoots) {
                this.mapArray = [];
                this.innerTrack = [];
                this.createMapArray();
            } else{
                console.log("track length: ", this.innerTrack.length);
                console.log("1st track point: ", this.innerTrack[0]);
                console.log("start line: ", this.innerStartLinePt);
                console.log("player start: ", this.playerStartPt);
            }
            
        }
    }

    // check if inner track goes beyond map height and map width buffer
    #checkInnerTrackBounds(innerTrack:number[][], innerBoundsSize:number, mapHeight:number, mapWidth:number) {
        let outOfBounds:boolean = false;
        for (let i = 0; i < innerTrack.length; i++) {
            if (innerTrack[i][0] < innerBoundsSize
                || innerTrack[i][0] > (mapHeight - 1) - innerBoundsSize
                || innerTrack[i][1] < innerBoundsSize
                || innerTrack[i][1] > (mapWidth - 1) - innerBoundsSize) {
                outOfBounds = true;
            }
        }

        return outOfBounds;
    }

    // checks if track contains narrow, long offshoots,
    // where two adjacent points both only have two neighbors from the rest of the track points
    #checkNarrowOffshoots(neighborMap:Map<string, coordinate>) {
        for (let key of neighborMap.keys()) {
            let neighbor:coordinate | undefined = neighborMap.get(key);

            if (neighbor != null && neighbor.numNeighbors <= 2) {
                let upCoordString = JSON.stringify(neighbor.upVert);
                let neighborUp:coordinate | undefined = neighborMap.get(upCoordString);

                let downCoordString = JSON.stringify(neighbor.downVert);
                let neighborDown:coordinate | undefined = neighborMap.get(downCoordString);
    
                let leftCoordString = JSON.stringify(neighbor.leftHorz);
                let neighborLeft:coordinate | undefined = neighborMap.get(leftCoordString);
    
                let rightCoordString = JSON.stringify(neighbor.rightHorz);
                let neighborRight:coordinate | undefined = neighborMap.get(rightCoordString);

                if ((neighborUp != null && neighborUp.numNeighbors == 2) 
                || (neighborDown != null && neighborDown.numNeighbors == 2)
                || (neighborLeft != null && neighborLeft.numNeighbors == 2)
                || (neighborRight != null && neighborRight.numNeighbors == 2)) {
                    return true;
                }
            }
        }
    }

    // checks if the points in the track double back on themselves
    #checkDoublingBack(trackCoordinates:number[][]) {
        for (let i = 0; i < trackCoordinates.length - 1; i++) {
            let currIndex = i;
            let nextIndex = i + 1;

            let heightDiff = Math.abs(trackCoordinates[nextIndex][0] - trackCoordinates[currIndex][0]);
            let widthDiff = Math.abs(trackCoordinates[nextIndex][1] - trackCoordinates[currIndex][1]);

            // dupicate points were already removed from the track arrays so if the sum of differences between their coordinates
            // is greater than 1, the track doubles back on itself
            if (heightDiff + widthDiff > 1) {
                return true;
            }
        }

        return false;
    }
}
