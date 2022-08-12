
/**
* Tests for FowLayer class.ts
*/

import ConfigData from "../src/lib/ConfigData";
import GenerateMap from "../src/lib/GenerateMap";
import Player from "../src/lib/Player";
import Fow from "../src/lib/FowLayer"
import {expect, test} from '@jest/globals'

// populate ConfigData object to use to create a new Checkpoints object
const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'
const fowRadius = 4; // tile units
const mapSize = tileMapHeight;
const mapArray = new Array(mapSize).fill(false).map(() => new Array(mapSize).fill(false));

let mapConfigData:ConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

// create a new GenerateMap onject to generate a race track
let mapGeneration:GenerateMap = new GenerateMap(mapConfigData);

// create a new Player object
let player:Player = new Player(mapGeneration, mapConfigData)
 
// create an new fow object 
let fowLayer:Fow = new Fow(mapConfigData, fowRadius);



// ----------------------------------Tests----------------------------------

// testing the radius of the fog of war
test('radius of the fog of war', () => {
    expect(fowLayer.getRadius()).toBe(fowRadius);
});


// testing the layer of the fog of war
test('layer of the fog of war', () => {
    expect(fowLayer.getLayerType()).toBe(false);
});


// testing the tile map dimensions
test('check mapArray dimensions', () => {
    expect(mapArray.length).toBe(tileMapHeight);

    for (let i = 0; i < mapArray.length; i++) {
        expect(mapArray[i].length).toBe(tileMapWidth);
    }
});


// check visibility when player is on it
test('visibility', () => {
    expect(fowLayer.isValidTile(player)).toBe(false);
});
