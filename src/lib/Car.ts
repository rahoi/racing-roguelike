import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"
import terrainArray from "./TerrainArray"
import Vector from "./Vector2"

export default class Car {
    // map variables
    map: MapArray;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    
    // player variables
    pos: Vector
    velocity: Vector
    heading: number
    steerAngle: number
    steerFactor: number

    // player components
    frontWheel: Vector
    backWheel: Vector
    wheelBase: number

    // player input
    accInput: number
    turnInput: number

    enginePower: number
    acceleration: Vector
    headingVector: Vector

    constructor(map: MapArray, mapConfigData: ConfigData) {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.map = map;
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        // car placement
        // this.pos = new Vector(map.firstPt[1] * this.tileDimension + this.tileDimension / 2,
        //                 (-1) * (map.firstPt[0] * this.tileDimension + this.tileDimension / 2))
        this.pos = new Vector(2000, -3000)

        // set initial velocity, heading, and steering
        this.heading = 0
        this.steerAngle = 0

        this.steerFactor = 15   // amount that front wheel turns
        this.wheelBase = 70     // distance between front and rear wheels
        
        this.enginePower = 25
    }

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean) {

        // -------- GET INPUT --------
        // steering setup
        this.turnInput = 0
        if (left) this.turnInput += 1
        if (right) this.turnInput -= 1
        this.steerAngle = this.turnInput * this.steerFactor

        // velocity setup
        this.velocity = new Vector(0,0)
        if (gas) {
            this.velocity.setX(Math.cos(this.heading * Math.PI / 180) * this.enginePower)
            this.velocity.setY(Math.sin(this.heading * Math.PI / 180) * this.enginePower)
            //console.log("INITIAL heading: " + this.heading)
            //console.log("INITIAL velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
        }
        // ----------------------------
    
        // calculate steering
        this.calculateSteering()

        // set new position
        this.pos = this.pos.add(this.velocity)
    }

    calculateSteering() {
        /* set up front wheel:
         * frontWheel = pos + wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        this.frontWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.frontWheel.multiplyScalar(this.wheelBase / 2)
        this.frontWheel.add(this.pos)

         
        /* set up back wheel:
         * backWheel = pos - wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        this.backWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.backWheel.multiplyScalar(this.wheelBase / 2)
        this.backWheel.subtract(this.pos).multiplyScalar(-1)
   

        /* move back wheel: backWheel += velocity */
        this.backWheel.add(this.velocity)
        //console.log("MOVE backWheel: (" + this.backWheel.getX() + ", " + this.backWheel.getY() + ")")


        /* move front wheel: frontWheel += velocity.rotate(steeringAngle) */
        this.frontWheel.add(this.velocity.rotated(this.steerAngle))
        //console.log("ROTATED velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
        //console.log("MOVE frontWheel: (" + this.frontWheel.getX() + ", " + this.frontWheel.getY() + ")")    
        

        /* calculate new direction vector: NORMALIZE(frontWheel - backWheel) */
        this.headingVector = this.frontWheel.subtract(this.backWheel).normalized()
        console.log("heading vector: (" + this.headingVector.getX() + ", " + this.headingVector.getY() + ")")
    
        
        /* set new heading angle and velocity */
        this.heading = this.headingVector.angle()
        this.velocity = this.headingVector.multiplyScalar(this.velocity.magnitude())
        //console.log("heading angle: " + this.heading)
        //console.log("FINAL velocity: (" + this.velocity.getX() + ", " + this.velocity.getY() + ")")
    }


    getLocX() {
        return this.pos.getX();
    }

    getLocY() {
        return this.pos.getY();
    }

    getHeading() {
        return this.heading
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
