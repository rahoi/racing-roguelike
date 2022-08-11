import ConfigData from "../src/lib/ConfigData"
import GenerateMap from "../src/lib/GenerateMap";
import Player from "../src/lib/Player"
import Checkpoints from "../src/lib/Checkpoints"
import Vector from "../src/lib/Vector2";
import {describe, expect, test} from '@jest/globals'

/**
* Tests for Checpoints.ts
*/
 
// populate ConfigData object to use to create a new Checkpoints object
const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'
 
let mapConfigData:ConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

// create a new GenerateMap onject to generate a race track
let mapGeneration:GenerateMap = new GenerateMap(mapConfigData);

// create a new Player object
let player:Player = new Player(mapGeneration, mapConfigData)
 
// create new Checkpoints object and generate checkpoints along the race track
let checkpoints:Checkpoints = new Checkpoints(mapGeneration, mapConfigData);

// testing number of checkpoints generated
test('number of checkpoints on the race track', () => {
    expect(checkpoints.numCheckpoints).toBe(checkpoints.checkpointsArray.length);
});

// testing total number of checkpoints player will need to collect
test('number of total checkpoints for the level', () => {
    expect(checkpoints.totalCheckpoints).toBe(checkpoints.numCheckpoints * checkpoints.numLaps);
});

// checking checkpoint visibility when player is on it
test('checkpoint visibility', () => {
    let radius:number = 4;

    // set player location near the current checkpoint
    let playerX:number = (checkpoints.getCheckpointCoordinate()[1] * tileDimension) - (radius * tileDimension / 2);
    let playerY:number = -1 * ((checkpoints.getCheckpointCoordinate()[0] * tileDimension) - (radius * tileDimension / 2));
    player.pos = new Vector(playerX, playerY);

    expect(checkpoints.isVisible(player, radius)).toBe(true);
});

// checking updating the checkpoint if the player collides with it (ie: is on the same coordinate)
test('checkpoint updating', () => {
    let radius:number = 4;

    // set player location at the current checkpoint
    let playerX:number = (checkpoints.getCheckpointCoordinate()[1] * tileDimension);
    let playerY:number = -1 * (checkpoints.getCheckpointCoordinate()[0] * tileDimension);
    player.pos = new Vector(playerX, playerY);

    expect(checkpoints.updateCheckpoint(player)).toBe(true);
});
