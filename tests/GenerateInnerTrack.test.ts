import ConfigData from "../src/lib/ConfigData"
import GenerateInnerTrack from "../src/lib/GenerateInnerTrack";
import terrainArray from "../src/lib/TerrainArray"
import {describe, expect, test} from '@jest/globals'
 
/**
* Tests for GenerateInnerTrack.ts
*/
 
// populate ConfigData object to use to create a new TrackGeneration object
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
// let borderWidth = Math.trunc(tileMapWidth * margin);
// let borderHeight = Math.trunc(tileMapHeight * margin);
// let innerBoundsSize = 3 // 2 tile buffer for the edges of the map, and 1 tile buffer for the outer track
let ptAdjustScale = 0.325;
let concavityVal = 80;
let convexityDifficulty = 0.25;
let convexityDisp = 12;
let trackAngle = 110; // in degrees
let splineAlpha = 0.99;
let splinePtsBtHull = 1;
let minTrackLength = 150;
let maxTrackLength = 250;

// creates GenerateInnerTrack object
let generateInnerTrack = new GenerateInnerTrack(numPts, margin, ptAdjustScale, concavityVal, convexityDifficulty, convexityDisp, trackAngle, splineAlpha, splinePtsBtHull, minTrackLength, maxTrackLength, mapConfigData);
let innerTrack:number[][] = generateInnerTrack.generate();

// ----------------------------------Tests----------------------------------

// testing inner track length
test('inner race track is longer than min length and shorter than max length', () => {
    let trackLen:number = innerTrack.length;

    expect(trackLen).toBeGreaterThan(minTrackLength);
    expect(trackLen).toBeLessThan(maxTrackLength);
});

// checking inner track doesn't loop back on itself (no duplicate coordinates)
test('check inner track doesn\'t loop back on itself', () => {
    let coordCount:Map<string, number> = new Map;
  
    for (let i = 0; i < innerTrack.length; i++) {
        let key:string = JSON.stringify(innerTrack[i]);
  
        if (coordCount.get(key) == null) {
            coordCount.set(key, 1);
        }
        else {
            let count:number = coordCount.get(key);
            coordCount.set(key, count++);
        }
    }
  
    let dupCoord:boolean = false;
    for (const [key, value] of coordCount.entries()) {
        if (value > 1) {
            dupCoord = true;
        }
    }
  
    expect(dupCoord).toBe(false);
});
 
// check all inner track coordinates are within the map's borders
test('inner track coordinates within map borders', () => {
    let withinBorder:boolean = true;

    for (let i = 0; i < innerTrack.length; i++) {
        if (innerTrack[i][0] < 0 || innerTrack[i][0] > tileMapHeight 
        || innerTrack[i][1] < 0 || innerTrack[i][1] > tileMapWidth) {
            withinBorder = false;
        }
    }

        expect(withinBorder).toBe(true);
});

// check start line coordinate is at index 1 of inner track array
test('start line is at index 1', () => {
    expect(generateInnerTrack.getStartLineCoord()).toBe(innerTrack[1]);
});

// check player start coordinate is at index 0 of inner track array
test('start line is at index 1', () => {
    expect(generateInnerTrack.getPlayerStart()).toBe(innerTrack[0]);
});

// check start line tile is a finish tile from terrainArray
test('start line is at index 1', () => {
    let finishTile:boolean = terrainArray.finishes.includes(generateInnerTrack.getStartTile());

    expect(finishTile).toBe(true);
});