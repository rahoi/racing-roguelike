import ConfigData from "../src/lib/ConfigData"
import GenerateInnerTrack from "../src/lib/GenerateInnerTrack"
import PlaceTrackTiles from "../src/lib/PlaceTrackTiles"
import terrainArray from "../src/lib/TerrainArray"
import {describe, expect, test} from '@jest/globals'
 
/**
* Tests for PlaceTrackTiles.ts
*/
 
// populate ConfigData object to use to create a new GenerateInnerTrack and PlaceTrackTiles object
const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'
 
let mapConfigData:ConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

// constant values used to generate race track and sent into GenerateInnerTrack
let numPts = 20;
let margin = 0.18;  // buffer around screen border
let ptAdjustScale = 0.325;
let concavityVal = 80;
let convexityDifficulty = 0.25;
let convexityDisp = 12;
let trackAngle = 110; // in degrees
let splineAlpha = 0.99;
let splinePtsBtHull = 1;
let minTrackLength = 150;
let maxTrackLength = 250;

// creates GenerateInnerTrack object to send innerTrack into PlaceTrackTiles
let generateInnerTrack:GenerateInnerTrack = new GenerateInnerTrack(numPts, margin, ptAdjustScale, concavityVal, convexityDifficulty, convexityDisp, trackAngle, splineAlpha, splinePtsBtHull, minTrackLength, maxTrackLength, mapConfigData);
let innerTrack:number[][] = generateInnerTrack.generate();
let isClockwise:boolean = generateInnerTrack.getIsClockwise();
let innerStartLineIndex:number = generateInnerTrack.getStartLineIndex();
let innerStartTile:number = generateInnerTrack.getStartTile();

// creates PlaceTrackTiles object
let placeTrackTiles:PlaceTrackTiles = new PlaceTrackTiles(innerTrack, tileMapHeight, tileMapWidth, isClockwise, innerStartLineIndex, innerStartTile);
let mapArray:number[][] = placeTrackTiles.fillTrackTiles();
let allTrackPoints:number[][] = placeTrackTiles.getAllTrackPts();
let outerRim:number[][] = placeTrackTiles.getOuterRim();

let outerStartLinePt:number[] = placeTrackTiles.getOuterStartLineCoord();
let outerStartTile:number = placeTrackTiles.getOuterStartTile();


// ----------------------------------Tests----------------------------------

// check mapArray dimensions are same as map height and width sent into ConfigData
test('check mapArray dimensions', () => {
    expect(mapArray.length).toBe(tileMapHeight);

    for (let i = 0; i < mapArray.length; i++) {
        expect(mapArray[i].length).toBe(tileMapWidth);
    }
});

// check length of allTrackPoints is at least double minTrackLength and less than double maxTrackLength
test('entire race track is longer than double min length and shorter than double max length', () => {
    let trackLen:number = allTrackPoints.length;

    expect(trackLen).toBeGreaterThan(minTrackLength * 2);
    expect(trackLen).toBeLessThan(maxTrackLength * 2);
});

// check outer track start line coordinate is next to inner track start line
test('check outer start line coordinate', () => {
    let nextTo:boolean = false;
    let innerStartLinePt:number[] = innerTrack[innerStartLineIndex];

    if (outerStartLinePt[0] == innerStartLinePt[0]) {
        if (outerStartLinePt[1] == innerStartLinePt[1] + 1 || outerStartLinePt[1] == innerStartLinePt[1] - 1) {
            nextTo = true;
        }
    }
    else if (outerStartLinePt[1] == innerStartLinePt[1]) {
        if (outerStartLinePt[0] == innerStartLinePt[0] + 1 || outerStartLinePt[0] == innerStartLinePt[0] - 1) {
            nextTo = true;
        }
    }

    expect(nextTo).toBe(true);
});

// check outer start coordinate is index 1 in outerRim array
test('outer start line is at index 1', () => {
    expect(outerStartLinePt).toStrictEqual(outerRim[1]);
});

// check outer start tile is a finish tile from terrainArray
test('outer start tile is a finish tile', () => {
    let finishTile:boolean = terrainArray.finishes.includes(outerStartTile);

    expect(finishTile).toBe(true);
});

// check outer start tile is the complement of inner start tile
test('check inner and outer start tiles are complements', () => {
    let complement:boolean = false;

    if (innerStartTile == terrainArray.finish_up && outerStartTile == terrainArray.finish_down 
    || innerStartTile == terrainArray.finish_down && outerStartTile == terrainArray.finish_up 
    || innerStartTile == terrainArray.finish_left && outerStartTile == terrainArray.finish_right
    || innerStartTile == terrainArray.finish_right && outerStartTile == terrainArray.finish_left) {
        complement = true;
    }

    expect(complement).toBe(true);
});