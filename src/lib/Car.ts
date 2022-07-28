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
    velocity: number
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
        this.velocity = 0
        this.heading = 0
        this.steerAngle = 0

        this.steerFactor = 10   // amount that front wheel turns
        this.wheelBase = 70     // distance between front and rear wheels
        
        this.enginePower = 25
    }

    updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean) {

        // -------- GET INPUT --------
        // set user input to 0
        this.accInput = 0
        this.turnInput = 0
        
        // check for user input
        if (gas) this.accInput += 1
        if (left) this.turnInput += 1
        if (right) this.turnInput -= 1

        // set steering based on input
        this.steerAngle = this.turnInput * this.steerFactor
        this.velocity = this.accInput * this.enginePower
        // ----------------------------
        


        // calculate steering
        this.calculateSteering()

   

    }

    calculateSteering() {
        // log X and Y positions
        //console.log("START x pos: " + this.pos.getX() + "\ny pos: " + this.pos.getY())


        /* set up front wheel
         * frontWheel = pos + wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
         this.frontWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
         this.frontWheel = this.frontWheel.multiplyScalar(this.wheelBase / 2)
         this.frontWheel = this.frontWheel.add(this.pos)

         
        /* set up back wheel
         * backWheel = pos - wheelBase/2 * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        this.backWheel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.backWheel = this.backWheel.multiplyScalar(this.wheelBase / 2)
        this.backWheel = this.backWheel.subtract(this.pos).multiplyScalar(-1)
   

        /* move back wheel:
         * backWheel += velocity * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        let tmpVel = new Vector(Math.cos(this.heading * Math.PI / 180), Math.sin(this.heading * Math.PI / 180))
        this.backWheel = this.backWheel.add(tmpVel.multiplyScalar(this.velocity))
        //console.log("backWheel x: " + this.backWheel.getX() + "\nbackWheel y: " + this.backWheel.getY())


        /* move front wheel:
         * frontWheel += velocity * new Vector(Math.cos(this.carHeading), Math.sin(this.carHeading)) */
        tmpVel.set(Math.cos((this.heading + this.steerAngle) * Math.PI / 180), Math.sin((this.heading + this.steerAngle) * Math.PI / 180))
        this.frontWheel = this.frontWheel.add(tmpVel.multiplyScalar(this.velocity))
        //console.log("frontWheel x: " + this.frontWheel.getX() + "\nfrontWheel y: " + this.frontWheel.getY())    
        


        /* calculate position:
         * pos = (frontWheel + backWheel) / 2 */
         this.pos = this.frontWheel.add(this.backWheel).divideScalar(2)
         this.heading = Math.atan2(this.frontWheel.getY() - this.backWheel.getY(),
                                         this.frontWheel.getX() - this.backWheel.getX()) * 180 / Math.PI
         //console.log("heading: " + this.heading)
         //console.log("END x pos: " + this.pos.getX() + "\ny pos: " + this.pos.getY())
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
