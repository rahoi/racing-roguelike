import ConfigData from "../src/lib/ConfigData"
import GenerateMap from "../src/lib/GenerateMap"
import Vector from "../src/lib/Vector2"
import Car from "../src/lib/Car"
import type Player from "../src/lib/Player"
import {expect, test} from '@jest/globals'

/**
 * Tests for car character movement
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
let player:Player = new Car(mapGeneration, mapConfigData)

// ----------------------------------Tests----------------------------------

/* test applyFriction() helper method */
test('apply friction', () => {
    // testing on track
    player.setLoc(mapGeneration.playerStartPt[1] * 128, mapGeneration.playerStartPt[0] * -128)
    player.acceleration = new Vector(1, 1)
    player.velocity = new Vector(20, 20)
    player.applyFriction()

    /* frictionForce = (-0.01, -0.01)
     * dragFroce = (-0.56568, -0.56568)
     * (1, 1) + (-0.01, -0.01) + (-0.56568, -0.56568) = (0.42431458, 0.42431458) */ 
    expect(player.acceleration.getX()).toBeCloseTo(0.42431458)
    expect(player.acceleration.getY()).toBeCloseTo(0.42431458)

    // testing off track
    player.setLoc(-1, -1)
    player.acceleration = new Vector(1, 1)
    player.velocity = new Vector(20, 20)
    player.applyFriction()

    /* frictionForce = (-0.1, -0.1)
     * dragFroce = -0.56568
     * (1, 1) + (-0.1, -0.1) + (-0.56568, -0.56568) = (0.33431458, 0.33431458) */
    expect(player.acceleration.getX()).toBeCloseTo(0.33431458)
    expect(player.acceleration.getY()).toBeCloseTo(0.33431458)
});

/* test calculateSteering() helper method */
test('calculate steering', () => {
    player.setLoc(0, 0)
    player.heading = 45
    player.steerAngle = 30
    player.velocity = new Vector(10, 10)
    player.calculateSteering(1)

    /* backWheel = (-46.3154, -46.3154)
     * frontWheel = (46.3154, 46.3154)
     * move backWheel = (-36.3154, -36.3154)
     * move frontWheel = (49.9757, 59.9756)
     * headingVector = (0.667378, 0.7447184)
     * heading = 48.13491
     * tmp = (9.43815, 10.5319086) */
    expect(player.velocity.getX()).toBeCloseTo(9.93819)
    expect(player.velocity.getY()).toBeCloseTo(10.05850)
});

/* test setNewPos() helper method */
test('set new position', () => {
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
    expect(player.acceleration.getY()).toBeCloseTo(0.0012) // engine power

    // gas, left
    player.setLoc(0, 0)
    player.heading = 0
    player.updateLoc(true, false, true, false, 1)
    expect(player.steerAngle).toBe(30) // steerFactor
    expect(player.acceleration.getX()).toBeCloseTo(0.0012) // engine power
    expect(player.acceleration.getY()).toBeCloseTo(0)

    // brake, right
    player.setLoc(0, 0)
    player.heading = 180
    player.updateLoc(false, true, false, true, 1)
    expect(player.steerAngle).toBe(-30) // steerFactor
    expect(player.acceleration.getX()).toBeCloseTo(-0.00045) // braking factor
    expect(player.acceleration.getY()).toBeCloseTo(0)
});
