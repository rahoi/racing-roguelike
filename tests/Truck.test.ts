import ConfigData from "../src/lib/ConfigData"
import GenerateMap from "../src/lib/GenerateMap"
import Vector from "../src/lib/Vector2"
import Truck from "../src/lib/Truck"
import type Player from "../src/lib/Player"
import {expect, test} from '@jest/globals'

/**
 * Tests for truck character movement
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

// create a new Car object
let player:Player = new Truck(mapGeneration, mapConfigData)

// ----------------------------------Tests----------------------------------

/* test applyFriction() helper method */
test('apply friction', () => {
    // testing on track
    player.setLoc(mapGeneration.playerStartPt[1] * 128, mapGeneration.playerStartPt[0] * -128)
    player.acceleration = new Vector(2, 2)
    player.velocity = new Vector(-5, -5)
    player.applyFriction()

    /* frictionForce = (-0.003, -0.003)
     * dragFroce = (-0.05303301, -0.05303301)
     * (2, 2) + (-0.003, -0.003) + (-0.05303301, -0.05303301) = (2.05603, 2.05603) */
    expect(player.acceleration.getX()).toBeCloseTo(2.05603)
    expect(player.acceleration.getY()).toBeCloseTo(2.05603)

    // testing off track
    player.setLoc(-1, -1)
    player.acceleration = new Vector(2, 2)
    player.velocity = new Vector(-5, -5)
    player.applyFriction()

    /* frictionForce = (-0.027, -0.027)
     * dragFroce = (-0.05303301, -0.05303301)
     * (2, 2) + (-0.027, -0.027) + (-0.05303301, -0.05303301) = (2.08003, 2.08003) */
    expect(player.acceleration.getX()).toBeCloseTo(2.08003)
    expect(player.acceleration.getY()).toBeCloseTo(2.08003)
});

/* test calculateSteering() helper method */
test('calculate steering', () => {
    // tested in Car.test.ts
});

/* test setPos() helper method */
test('set position', () => {
    // move player in bounds
    player.setLoc(mapGeneration.playerStartPt[1] * 128, mapGeneration.playerStartPt[0] * -128)
    player.acceleration = new Vector(1, 0)
    player.velocity = new Vector(20, 0)
    player.setNewPos(1)
    expect(player.getLoc()).toStrictEqual(new Vector(mapGeneration.playerStartPt[1] * 128 + 21, mapGeneration.playerStartPt[0] * -128))

    // try to move player out of bounds
    player.setLoc(mapConfigData.mapWidth * mapConfigData.tileDimension - 10, mapGeneration.playerStartPt[0] * -128)
    player.acceleration = new Vector(1, 0)
    player.velocity = new Vector(20, 0)
    player.setNewPos(1)
    expect(player.getLoc()).toStrictEqual(new Vector(mapConfigData.mapWidth * mapConfigData.tileDimension - player.wheelBase / 2, mapGeneration.playerStartPt[0] * -128))
});

/* test onTrack() helper method */
test('on track', () => {
    // on track
    player.setLoc(mapGeneration.playerStartPt[1] * 128, mapGeneration.playerStartPt[0] * -128)
    expect(player.onTrack()).toBe(true)

    // off track
    player.setLoc(-1, -1)
    expect(player.onTrack()).toBe(false)
});

/* test if input works */
test('check input', () => {
        // gas
        player.setLoc(0, 0)
        player.heading = 90
        player.updateLoc(true, false, false, false, 1)
        expect(player.steerAngle).toBe(0)
        expect(player.acceleration.getX()).toBeCloseTo(0)
        expect(player.acceleration.getY()).toBeCloseTo(0.0021) // engine power
    
        // gas, left
        player.setLoc(0, 0)
        player.heading = 0
        player.updateLoc(true, false, true, false, 1)
        expect(player.steerAngle).toBe(28) // steerFactor
        expect(player.acceleration.getX()).toBeCloseTo(0.0021) // engine power
        expect(player.acceleration.getY()).toBeCloseTo(0)
    
        // brake, right
        player.setLoc(0, 0)
        player.heading = 180
        player.updateLoc(false, true, false, true, 1)
        expect(player.steerAngle).toBe(-28) // steerFactor
        expect(player.acceleration.getX()).toBeCloseTo(-0.0008) // braking factor
        expect(player.acceleration.getY()).toBeCloseTo(0)
});
