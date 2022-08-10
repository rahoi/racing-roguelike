import TrackGeneration from "./TrackGeneration"
import type ConfigData from "./ConfigData"

/**
 * GenerateMap, calls TrackGeneration to create the map array for the Phaser game,
 * and stores information regarding the track to be more easily used in GameScene
 */
export default class GenerateMap {
    mapArray:number[][];    // array of tiles in map

    innerTrack:number[][];  // track points on inner track
    outerTrack:number[][];  // track points on outer track

    allTrackCoordinates:number[][]; // all track points

    innerStartLinePt:number[];  // coordinate of start line on the inner track
    innerStartTile:number;  // tile at inner start line
    innerStartLineIndex:number; // index of start line in inner track array

    outerStartLinePt:number[];  // coordinate of start line on the outer track
    outerStartTile:number;  // tile at outer start line

    playerStartPt:number[]; // coordinate of the player's starting point

    isClockwise:boolean;    // true if innerTrack runs clockwise

    track:TrackGeneration;
    
    /**
     * creates a new TrackGeneration object to generate a race track and stores info about it in class properties
     * 
     * @param mapConfigData ConfigData object containing info regarding the game
     */
    constructor(mapConfigData: ConfigData) {
        // creates a new TrackGeneration object and calls createMapArray to generate a new race track
        this.track = new TrackGeneration(mapConfigData);
        this.track.createMapArray();

        this.mapArray = this.track.mapArray;

        this.innerTrack = this.track.innerTrack;
        this.outerTrack = this.track.outerTrack;

        this.allTrackCoordinates = this.track.allTrackPoints;

        this.innerStartLinePt = this.track.innerStartLinePt;
        this.innerStartTile = this.track.innerStartTile;
        this.innerStartLineIndex = this.track.innerStartLineIndex;

        this.outerStartLinePt = this.track.outerStartLinePt;
        this.outerStartTile = this.track.outerStartTile;

        this.playerStartPt = this.track.playerStartPt;

        this.isClockwise = this.track.isClockwise;
    }
}
