import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"
import terrainArray from "./TerrainArray"
import Vector from "./Vector2"

export default class Player {
    // map variables
    map: MapArray;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;

    // player input
    accInput: number
    turnInput: number
    
    // player vectors
    pos: Vector
    velocity: Vector
    headingVector: Vector
    acceleration: Vector
    frontWheel: Vector
    backWheel: Vector

    // player angles
    heading: number
    steerAngle: number
    
    // player attributes
    wheelBase: number
    steerFactor: number
    enginePower: number
    brakingFactor: number
    maxReverseSpeed: number

    // environment attributes
    friction: number
    drag: number
    slipSpeed: number
    tractionFast: number
    tractionSlow: number


    constructor(map: MapArray, mapConfigData: ConfigData) {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.map = map;
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        // car placement
        this.pos = new Vector(map.firstPt[1] * this.tileDimension + this.tileDimension / 2,
                        (-1) * (map.firstPt[0] * this.tileDimension + this.tileDimension / 2))
        //this.pos = new Vector(2000, -3000) // for testing

        // set initial velocity and player angles
        this.velocity = new Vector(0,0)
        this.heading = 0
        this.steerAngle = 0
    
        // set player attributes
        this.wheelBase = 70             // distance between front and rear wheels
        this.steerFactor = 15           // amount that front wheel turns
        this.enginePower = 1.5          // forward acceleration force
        this.brakingFactor = -0.05      // backwards acceleration force
        this.maxReverseSpeed = 50       // max reverse velocity

        // set environment attributes: at speed 600, drag force overcomes friction force
        this.friction = -0.02
        this.drag = -0.001
        this.slipSpeed = 10
        this.tractionFast = 0.00001
        this.tractionSlow = 0.7
    }

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean) {
        this.acceleration = new Vector(0,0)

        /* steering input */
        this.turnInput = 0
        if (left) this.turnInput += 1
        if (right) this.turnInput -= 1
        this.steerAngle = this.turnInput * this.steerFactor

        /* acceleration input */
        if (gas) {
            //console.log("GAS ------------------------------------------")
            this.acceleration.setX(Math.cos(this.heading * Math.PI / 180) * this.enginePower)
            this.acceleration.setY(Math.sin(this.heading * Math.PI / 180) * this.enginePower)
        }

        /* braking input */
        if (brake) {
            //console.log("BRAKE ------------------------------------------")
            this.acceleration.setX(Math.cos(this.heading * Math.PI / 180) * this.brakingFactor)
            this.acceleration.setY(Math.sin(this.heading * Math.PI / 180) * this.brakingFactor)
        }
        
        /* set up velocity dependents */
        this.applyFriction()
        this.calculateSteering()
        //console.log("velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
        //console.log("added acc: (" + this.acceleration.getX() + ", " + this.acceleration.getY() + ")")

        /* set new position */
        this.velocity = Vector.add(this.velocity, this.acceleration)
        this.pos = Vector.add(this.pos, this.velocity)
        //console.log("pos: (" + this.pos.getX() + ", " + this.pos.getY() + ")")
    }

    applyFriction() {
        if (this.velocity.getMagnitude() < 0.02) {
            this.velocity.set(0,0)
        }

        let frictionForce = Vector.multiplyScalar(this.velocity, this.friction)
        let dragForce = Vector.multiplyScalar(this.velocity, this.velocity.getMagnitude())
        dragForce = Vector.multiplyScalar(dragForce, this.drag)

        if (this.velocity.getMagnitude() < 50) {
            frictionForce = Vector.multiplyScalar(frictionForce, 3)
        }

        this.acceleration = Vector.add(this.acceleration, dragForce)
        this.acceleration = Vector.add(this.acceleration, frictionForce)
    }

    calculateSteering() {
        /* set up back wheel:
         * backWheel = pos - wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        this.backWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.backWheel = Vector.multiplyScalar(this.backWheel, this.wheelBase / 2)
        this.backWheel = Vector.subtract(this.pos, this.backWheel)

        /* set up front wheel:
         * frontWheel = pos + wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        this.frontWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.frontWheel = Vector.multiplyScalar(this.frontWheel, this.wheelBase / 2)
        this.frontWheel = Vector.add(this.pos, this.frontWheel)
   
        /* move back wheel: backWheel += velocity */
        this.backWheel = Vector.add(this.backWheel, this.velocity)

        /* move front wheel: frontWheel += velocity.rotate(steeringAngle) */
        let velRotated = this.velocity.rotate(this.steerAngle)
        this.frontWheel = Vector.add(this.frontWheel, velRotated)
       
        /* calculate new direction vector: NORMALIZE(frontWheel - backWheel) */
        this.headingVector = Vector.subtract(this.frontWheel, this.backWheel)
        this.headingVector = this.headingVector.normalize()
        
        /* calculate new heading angle */
        this.heading = this.headingVector.getAngle()

        /* determine what traction */
        let traction = this.tractionSlow
        if (this.velocity.getMagnitude() > this.slipSpeed) {
            traction = this.tractionFast
        }
        
        /* find new velocity */
        let velNorm = this.velocity.normalize()
        let d = Vector.dot(this.headingVector, velNorm)
        if (d > 0) {
            let tmp = Vector.multiplyScalar(this.headingVector, this.velocity.getMagnitude())
            this.velocity = Vector.lerp(tmp, this.velocity, traction)
        } else if (d < 0) {
            this.velocity = Vector.multiplyScalar(this.headingVector, Math.min(this.velocity.getMagnitude(), this.maxReverseSpeed))
            this.velocity = Vector.multiplyScalar(this.velocity, -1)
        }
        //console.log("FINAL velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
    }

    getLocX() {
        return this.pos.getX();
    }

    getLocY() {
        return this.pos.getY();
    }

    getHeading() {
        return this.heading;
    }

    playerMask(scene: Phaser.Scene){
        const mask = scene.make.image({
            x: this.pos.getX(),
            y: this.pos.getY(),
            key: 'mask',
            add: true
        });
    }

    onTrack() {
        let currTile = this.map.mapArray[Math.trunc(this.pos.getY() / 128)][Math.trunc(this.pos.getX() / 128)]
        
        // logging car's position on the tilemap (not its pixel position)
        // console.log("x: ", Math.trunc(this.posX / 128), " y: ", Math.trunc(this.posY / 128))

        // logs if the car is on the race track
        // if (terrainArray.roadTileArray.includes(this.currTile)) {
        //     console.log("on track")
        // }
        
        // returns true if the car is on the race track
        return (terrainArray.roadTileArray.includes(currTile)) 
    }
}
