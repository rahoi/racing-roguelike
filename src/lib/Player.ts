import type ConfigData from "./ConfigData"
import type GenerateMap from "./GenerateMap"
import terrainArray from "./TerrainArray"
import Vector from "./Vector2"

export default class Player {
    // map variables
    map: GenerateMap;
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

    // stall variables
    stall: number
    stallThreshold: number

    // environment attributes
    friction: number
    drag: number
    slipSpeed: number
    tractionFast: number
    tractionSlow: number
    offRoadFactor: number

    constructor(map: GenerateMap, mapConfigData: ConfigData) {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.map = map;
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        // car placement
        this.pos = new Vector(map.playerStartPt[1] * this.tileDimension + this.tileDimension / 2,
                        (-1) * (map.playerStartPt[0] * this.tileDimension + this.tileDimension / 2))

        // set initial heading
        if (map.innerStartLinePt[0] - map.playerStartPt[0] != 0) {
            if (map.innerStartLinePt[0] - map.playerStartPt[0] < 0) {
                this.heading = 90
            } else {
                this.heading = 270
            }
        } else if (map.innerStartLinePt[1] - map.playerStartPt[1] != 0 ){
            if (map.innerStartLinePt[1] - map.playerStartPt[1] < 0) {
                this.heading = 180
            } else {
                this.heading = 0
            }
        }

        // set initial velocity and steering angle
        this.velocity = new Vector(0,0)
        this.steerAngle = 0
        this.stall = 0
        this.stallThreshold = 1
    }

    setLoc(x: number, y: number) {
        this.pos.set(x, y)
    }

    getLoc() {
        return this.pos;
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

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean, dt: any) {
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
        this.calculateSteering(dt)
        this.setNewPos(dt)
    }

    applyFriction() {
        /* set minimum speed */
        if (this.velocity.getMagnitude() < 0.0005) {
            this.velocity.set(0,0)
        }

        /* set friction (prop to vel) and drag (wind resistance: prop to vel squared):
         * frictionForce = velocity * friction 
         * dragForce = velocity * vel.mag * drag */
        let frictionForce = Vector.multiplyScalar(this.velocity, this.friction)
        let dragForce = Vector.multiplyScalar(this.velocity, this.velocity.getMagnitude())
        dragForce = Vector.multiplyScalar(dragForce, this.drag)

        /* off road has more friction) */
        if (!this.onTrack()) {
            frictionForce = Vector.multiplyScalar(frictionForce, this.offRoadFactor)
        }

        this.acceleration = Vector.add(this.acceleration, dragForce)
        this.acceleration = Vector.add(this.acceleration, frictionForce)
    }

    calculateSteering(dt: any) {
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
   
        /* move back wheel: backWheel += velocity * dt */
        let velDt = Vector.multiplyScalar(this.velocity, dt)
        this.backWheel = Vector.add(this.backWheel, velDt)

        /* move front wheel: frontWheel += velocity.rotate(steeringAngle) * dt */
        let velRotated = velDt.rotate(this.steerAngle)
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
        
        /* find new velocity:
         * velocity = lerp(headingVector * vel.mag, velocity, traction)
         *          = (headingVector * vel.mag * traction) + (1 - traction * velocity) */
        let velNorm = this.velocity.normalize()
        let d = Vector.dot(this.headingVector, velNorm)
        if (d > 0) {
            let tmp = Vector.multiplyScalar(this.headingVector, this.velocity.getMagnitude())
            this.velocity = Vector.lerp(tmp, this.velocity, traction)
            this.stall = 0
        } else if (d < 0 && this.stall === this.stallThreshold) {
            this.velocity = Vector.multiplyScalar(this.headingVector, Math.min(this.velocity.getMagnitude(), this.maxReverseSpeed))
            this.velocity = Vector.multiplyScalar(this.velocity, -1)
        } else if (d < 0) {
            this.velocity = Vector.multiplyScalar(this.velocity, 0)
            this.acceleration = Vector.multiplyScalar(this.acceleration, 0)
            this.stall++
        }
    }

    setNewPos(dt: any) {
        /* set acc and velocity based on dt */
        this.acceleration = Vector.multiplyScalar(this.acceleration, dt)
        this.velocity = Vector.add(this.velocity, this.acceleration)
        let velDt = Vector.multiplyScalar(this.velocity, dt)
        
        /* set new position */
        this.pos = Vector.add(this.pos, velDt)
        
        /* check if player is out of bounds */
        if (this.pos.getX() < this.wheelBase / 2) {
            this.velocity.set(0,0)
            this.pos.setX(this.wheelBase / 2)
        } else if (this.pos.getX() > this.mapWidth * this.tileDimension - this.wheelBase / 2) {
            this.velocity.set(0,0)
            this.pos.setX(this.mapWidth * this.tileDimension - this.wheelBase / 2)
        }

        if (this.pos.getY() > (-1) * this.wheelBase / 2) {
            this.velocity.set(0,0)
            this.pos.setY((-1) * this.wheelBase / 2)
        } else if (this.pos.getY() < (-1) * (this.mapHeight * this.tileDimension - this.wheelBase / 2)) {
            this.velocity.set(0,0)
            this.pos.setY((-1) * (this.mapHeight * this.tileDimension - this.wheelBase / 2))
        }

        /* logging added acceleration, velocity, and position */
        //console.log("added acc: (" + this.acceleration.getX() + ", " + this.acceleration.getY() + ")")
        //console.log("velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
        //console.log("vel mag: " + velDt.getMagnitude())
        //console.log("pos: (" + this.pos.getX() + ", " + this.pos.getY() + ")")
    }

    onTrack() {
        let currTile = this.map.mapArray[Math.trunc((-1) * this.pos.getY() / this.tileDimension)][Math.trunc(this.pos.getX() / this.tileDimension)]
        
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
