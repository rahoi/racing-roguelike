import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"
import terrainArray from "./TerrainArray"

export default class Car {
    map: MapArray;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    posX: number;
    posY: number;
    angle: number;
    speed: number;
    stall: number;
    maxVel: number;
    friction: number;
    mass: number;
    turnPower: number;
    gasPower: number;
    brakePower: number;
    offRoad: number;
    onRoad: number;

    forceX: number;
    forceY: number;
    direction: number;
    acc: number;
    vel: number;
    force: number;

    accY: number
    accX: number
    velX: number
    velY: number
    angleDiff: number

    // new stuff
    accFactor: number

    accInput: number
    steeringInput: number
    rotationAngle: number

    engineForceVector: number
    netForce: number
    handling: number
    steeringForceVector: number
    turnFactor: number

    drag: number



    constructor(map: MapArray, mapConfigData: ConfigData) {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.map = map;
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        // car placement
        this.posX = map.firstPt[1] * this.tileDimension + this.tileDimension / 2;
        this.posY = (-1) * (map.firstPt[0] * this.tileDimension + this.tileDimension / 2);
        this.angle = 0;
        this.direction = this.angle;
       
        // car physics
        this.acc = 0;
        this.vel = 0;
        this.maxVel = 10;
        this.forceX = 0;
        this.forceY = 0;
        this.force = 0;
        this.stall = 0;

        this.velY = 0
        this.velX = 0
        this.accX = 0
        this.accY = 0
        
        // car attributes
        this.mass = 5;
        this.turnPower = 2.5;
        this.gasPower = 0.8;
        this.brakePower = 1;
        this.onRoad = 0.3;
        this.offRoad = 0.3;

        // new attributes
        this.handling = 2.5
        this.accFactor = 0.2
        this.rotationAngle = 0
        this.netForce = 0
        this.turnFactor = 0.5

    }

    updateLoc(gas: number, brake: number, left: number, right: number) {
        console.log("----------- NEW UPDATELOC -----------")

        // create input vectors
        this.accInput = gas
        this.steeringInput = right - left

        // initialize netForce
        this.forceX = 0
        this.forceY = 0

        // ------- APPLY FORCES ---------
        // engine force
        this.applyEngineForce()

        // steering force (if car has velocity)
        if (this.velX != 0 || this.velY != 0) {
            this.applySteeringForce()
        }

        // counter forces
        if (this.velX != 0 || this.velY != 0) {
            this.applyDragForce()
        }

        // calulate velocity and set location
        this.setVel();
        this.setLoc();
    }

    applyDragForce() {
        // apply drag if there is no gas being pressed, so that the car stops
        this.addForce(0.5, this.angle - 180)
    }

    applyEngineForce() {
        // create a force for the engine, F = ma
        this.engineForceVector = this.accInput * this.accFactor * this.mass

        // apply force to push the car forward
        this.addForce(this.engineForceVector, this.angle)
        console.log("engine force: " + this.engineForceVector)  
    }

    applySteeringForce() {
        // create a perpendicular force, F = ma
        this.steeringForceVector = this.steeringInput * this.turnFactor * this.mass

        // apply steering by rotating the car object
        console.log("steering force: " + this.steeringForceVector)    
        this.addForce(this.steeringForceVector, this.angle - 90)

        // update the rotation angle based on input
        console.log("angle: " + this.angle)
        this.angle -= this.steeringInput * this.handling
    }

    addForce(forceVector: number, angle: number) {
        //this.netForce += forceVector
        // take the angle we are at and make it forward or sideways based on that
        this.forceX += Math.cos(angle * Math.PI / 180) * forceVector
        this.forceY += Math.sin(angle * Math.PI / 180) * forceVector

        // // add drag force
        // if (this.forceX != 0 || this.velX > 0) {
        //     this.forceX -= Math.cos(angle * Math.PI / 180) * this.drag
        // }

        // if (this.forceY != 0 || this.velY > 0) {
        //     this.forceY -= Math.sin(angle * Math.PI / 180) * this.drag
        // }
    }

    setVel() {
        // find net acceleration, a_net = F_net / mass
        //this.acc = this.netForce / this.mass
        this.accX = this.forceX / this.mass
        this.accY = this.forceY / this.mass
        console.log("accX: " + this.accX + "\naccY: " + this.accY)


        // find net velocity
        //this.vel += this.acc;
        this.velX += this.accX
        this.velY += this.accY

        if (this.velX > this.maxVel) {
            this.velX = this.maxVel;
        }

        if (this.velY > this.maxVel) {
            this.velY = this.maxVel;
        }

        console.log("velX: " + this.velX + "\nvelY: " + this.velY)
    }

    setLoc() {
        this.posX += this.velX
        this.posY += this.velY
        console.log("x pos: " + this.posX + "\ny pos: " + this.posY)
    }
    
    getLocX() {
        return this.posX;
    }

    getLocY() {
        return this.posY;
    }

    getAngle() {
        return this.angle;
    }


    // updateDir(dir: dir) {
    //     //if (dir.right && (this.velX != 0 || this.velY != 0)) {
    //     if (dir.right) {
    //         this.angle -= this.turnPower
    //         this.direction -= this.turnPower
    //         this.angleDiff = (-1) * this.turnPower // carsprite
    //     //} else if (dir.left && (this.velX != 0 || this.velY != 0)) {
    //     } else if (dir.left) {
    //         this.angle += this.turnPower
    //         this.direction += this.turnPower
    //         this.angleDiff = this.turnPower
    //     } else {
    //         this.angleDiff = 0
    //     }
    // }
    

    // updateLoc(force: force) {

        // // ----------- CALCULATING THE FORCES -----------
        // // player force
        // if (force.brake && (this.velX < 0 || this.velY < 0)) {
        //     this.direction = this.angle - 180;
        //     this.forceX = this.gasPower
        //     this.forceY = this.gasPower
        // } else if (force.brake && (this.velX > 0 || this.velY > 0)) {
        //     this.forceX = (-1) * this.brakePower
        //     this.forceY = (-1) * this.brakePower
        // } else if (force.gas) {
        //     this.direction = this.angle;
        //     this.forceX = this.gasPower
        //     this.forceY = this.gasPower
        //     // console.log("forceX: " + this.forceX)
        //     // console.log("forceY: " + this.forceY)
        // } else {
        //     this.forceX = 0
        //     this.forceY = 0
        // }

        // //this.force = Math.sqrt(Math.pow(this.forceX, 2) + Math.pow(this.forceY, 2));
        
        // // static friction?

        // // road friction force, kinetic friction
        // if ((this.direction === this.angle && this.velX > 0 && this.velY > 0)
        //         || (this.direction != this.angle && this.velX < 0 && this.velY < 0)) {
        //     if (this.onTrack()) {
        //         this.forceX -= this.onRoad
        //         this.forceY -= this.onRoad
        //     } else {
        //         this.forceX -= this.offRoad
        //         this.forceY -= this.offRoad
        //     }
        // }


        // // -------- CALCULATING THE ACCELERTATION --------
        // //this.acc = this.force / this.mass;
        // this.accX = this.forceX / this.mass;
        // this.accY = this.forceY / this.mass;

        // // ---------- CALCULATING THE VELOCITY -----------
        // // this.vel += this.acc;

        // // if (this.vel > this.maxVel) {
        // //     this.vel = this.maxVel;
        // // }

        // this.velX += this.accX
        // this.velY += this.accY
        // console.log("velX = " + this.velX)
        // console.log("velY = " + this.velX)

        // // ---------- CALCULATING THE LOCATION -----------
        // this.posX += Math.cos(this.direction * Math.PI / 180) * this.velX
        // this.posY -= Math.sin(this.direction * Math.PI / 180) * this.velY





        // if (force.s) { // braking
        //     if (this.speed > 0) {
        //         this.speed -= this.brakePower
        //     }
        //     if (this.speed <= 0 && this.stall < 10) { // coming to a stop
        //         this.speed = 0
        //         this.stall++
        //     } else { // reversing
        //         this.speed -= this.acc
        //         if (Math.abs(this.speed) > this.maxSpeed) {
        //             this.speed = this.maxSpeed * -1
        //         }
        //     }
        //     this.updateMap()
        // } else if (force.w) { // accelerating
        //     this.speed += this.acc
        //     if (this.speed > this.maxSpeed) {
        //         this.speed = this.maxSpeed
        //     }
        //     this.updateMap()
        //     this.stall = 0
        // } else if (!force.w) { // coasting
        //     if (this.speed > 0) { // moving forward
        //         this.speed = (this.speed * this.dec)
        //         if (this.speed < 0) { // coming to a stop
        //             this.speed = 0
        //         }
        //     }
        //     if (this.speed < 0) { // moving backwards
        //         this.speed = (this.speed * this.dec)
        //     }
        //     this.updateMap()
        //     this.stall = 0
        // }
    // }

    // updateMap() {
        // if (!this.onTrack()) {
        //     this.speed = this.speed * this.offRoad
        // }

        // this.posX += Math.cos(this.angle * Math.PI / 180) * this.speed
        // this.posY += Math.sin(this.angle * Math.PI / 180) * this.speed
        
        // if (this.posX < 32) {
        //     this.speed = 0
        //     this.posX = 32
        // } else if (this.posX > this.tileDimension * this.mapWidth - 32) {
        //     this.speed = 0
        //     this.posX = this.tileDimension * this.mapWidth - 32
        // }

        // if (this.posY < 32) {
        //     this.speed = 0
        //     this.posY = 32
        // } else if (this.posY > this.tileDimension * this.mapHeight - 48) {
        //     this.speed = 0
        //     this.posY = this.tileDimension * this.mapHeight - 48
        // }
    // }

    onTrack() {
        let currTile = this.map.mapArray[Math.trunc(this.posY / 128)][Math.trunc(this.posX / 128)]
        
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
