import ConfigData from "../src/lib/ConfigData"
import TrackGeneration from "../src/lib/TrackGeneration"
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
 
let mapConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);
 
// create new TrackGeneration object and generate a random race track
let track = new TrackGeneration(mapConfigData);
track.createMapArray();
 
// testing track length
test('inner race track is longer than min length and shorter than max length', () => {
   let trackLen = track.innerTrack.length;
   expect(trackLen).toBeGreaterThan(track.minTrackLength);
   expect(trackLen).toBeLessThan(track.maxTrackLength);
});
 
// checking track doesn't loop back on itself (no duplicate coordinates)
test('check track doesn\'t loop back on itself', () => {
   let coordCount = new Map;
 
   for (let i = 0; i < track.allTrackPoints.length; i++) {
       let key = JSON.stringify(track[i]);
 
       if (coordCount.get(key) == null) {
           coordCount.set(key, 1);
       }
       else {
           let count = coordCount.get(key);
           coordCount.set(key, count++);
       }
   }
 
   let dupCoord = false;
   for (const [key, value] of coordCount.entries()) {
       if (value > 1) {
           dupCoord = true;
       }
   }
 
   expect(dupCoord).toBe(false);
});
