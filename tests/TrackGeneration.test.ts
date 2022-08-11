import ConfigData from "../src/lib/ConfigData"
import TrackGeneration from "../src/lib/TrackGeneration"
import terrainArray from "../src/lib/TerrainArray"
import {describe, expect, test} from '@jest/globals'
 
/**
* Tests for TrackGeneration.ts
*/
 
// populate ConfigData object to use to create a new TrackGeneration object
const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'
 
let mapConfigData:ConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);
 
// create new TrackGeneration object and generate a random race track
let track:TrackGeneration = new TrackGeneration(mapConfigData);
track.createMapArray();
 

// ----------------------------------Tests----------------------------------

// testing track length
test('inner race track is longer than min length and shorter than max length', () => {
   let trackLen:number = track.innerTrack.length;
   expect(trackLen).toBeGreaterThan(track.minTrackLength);
   expect(trackLen).toBeLessThan(track.maxTrackLength);
});
 
// checking track doesn't loop back on itself (no duplicate coordinates)
test('check track doesn\'t loop back on itself', () => {
   let coordCount:Map<string, number> = new Map;
 
   for (let i = 0; i < track.allTrackPoints.length; i++) {
       let key:string = JSON.stringify(track[i]);
 
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

// check all track coordinates are within the map's borders
test('all track coordinates within map borders', () => {
    let withinBorder:boolean = true;

    for (let i = 0; i < track.allTrackPoints.length; i++) {
        if (track.allTrackPoints[i][0] < 0 || track.allTrackPoints[i][0] > tileMapHeight 
        || track.allTrackPoints[i][1] < 0 || track.allTrackPoints[i][1] > tileMapWidth) {
            withinBorder = false;
        }
    }

    expect(withinBorder).toBe(true);
});

// check player start is at index 0 of inner track array
test('check player start coordinate', () => {
    expect(track.playerStartPt).toBe(track.innerTrack[0]);
});

// check start line is at index 1 of inner track array
test('check inner start line coordinate', () => {
    expect(track.innerStartLinePt).toBe(track.innerTrack[1]);
});

// check inner start line tile is a finish tile from terrainArray
test('check inner start line tile', () => {
    let finishTile:boolean = false;

    if (terrainArray.finishes.includes(track.innerStartTile)) {
        finishTile = true;
    }

    expect(finishTile).toBe(true);
});

// check outer track start line coordinate is next to inner track start line
test('check outer start line coordinate', () => {
    let nextTo:boolean = false;

    if (track.outerStartLinePt[0] == track.innerStartLinePt[0]) {
        if (track.outerStartLinePt[1] == track.innerStartLinePt[1] + 1 || track.outerStartLinePt[1] == track.innerStartLinePt[1] - 1) {
            nextTo = true;
        }
    }
    else if (track.outerStartLinePt[1] == track.innerStartLinePt[1]) {
        if (track.outerStartLinePt[0] == track.innerStartLinePt[0] + 1 || track.outerStartLinePt[0] == track.innerStartLinePt[0] - 1) {
            nextTo = true;
        }
    }

    expect(nextTo).toBe(true);
});

// check outer start line tile is a finish tile from terrainArray
test('check outer start line tile', () => {
    let finishTile:boolean = false;

    if (terrainArray.finishes.includes(track.outerStartTile)) {
        finishTile = true;
    }

    expect(finishTile).toBe(true);
});