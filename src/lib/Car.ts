import type ConfigData from "./ConfigData"
import type MapArray from "./MapArray"
import terrainArray from "./TerrainArray"
import type {force, dir} from "./forceDirTypes"

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

    constructor(map: MapArray, mapConfigData: ConfigData) {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        // this.posX = 220,
        // this.posY = 320,
        this.map = map;
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;

        // car placement
        this.posX = map.firstPt[1] * this.tileDimension + this.tileDimension / 2;
        this.posY = map.firstPt[0] * this.tileDimension + this.tileDimension / 2;
        this.angle = 0;
        this.direction = this.angle;
       
        // car calculations
        this.acc = 0;
        this.vel = 0;
        this.maxVel = 10;
        this.forceX = 0;
        this.forceY = 0;
        this.force = 0;
        this.stall = 0;
        
        // car attributes
        this.mass = 5;
        this.turnPower = 2.5;
        this.gasPower = 0.8;
        this.brakePower = 0.5;
        this.onRoad = 0.1;
        this.offRoad = 0.1;
    }

    updateDir(dir: dir) {
        if (dir.right && this.vel != 0) {
            this.angle += this.turnPower
        } else if (dir.left && this.vel != 0) {
            this.angle -= this.turnPower
        }
    }

    updateLoc(force: force) {

        // ----------- CALCULATING THE FORCES -----------
        // player force
        if (force.brake) {
            this.direction = this.direction - 180;
            this.forceX = Math.cos(this.direction * Math.PI / 180) * this.brakePower
            this.forceY = Math.sin(this.direction * Math.PI / 180) * this.brakePower
        } else if (force.gas) {
            this.direction = this.angle;
            this.forceX = Math.cos(this.direction * Math.PI / 180) * this.gasPower
            this.forceY = Math.sin(this.direction * Math.PI / 180) * this.gasPower
        }
        
        // road friction force
        // if (this.onTrack()) {
        //     this.forceX += Math.cos((this.direction - 180) * Math.PI / 180) * this.onRoad
        //     this.forceY += Math.sin((this.direction - 180) * Math.PI / 180) * this.onRoad
        // } else {
        //     this.forceX += Math.cos((this.direction - 180) * Math.PI / 180) * this.offRoad
        //     this.forceY += Math.sin((this.direction - 180) * Math.PI / 180) * this.offRoad
        // }

        this.force = Math.pow(this.forceX, 2) + Math.pow(this.forceY, 2);


        // -------- CALCULATING THE ACCELERTATION --------
        this.acc = this.force / this.mass;


        // ---------- CALCULATING THE VELOCITY -----------
        this.vel += this.acc;

        if (this.vel > this.maxVel) {
            this.vel = this.maxVel;
        }

        // ---------- CALCULATING THE LOCATION -----------
        // this.posX += this.velX;
        // this.posY += this.velY;
        
        this.posX += Math.cos(this.angle * Math.PI / 180) * this.vel
        this.posY += Math.sin(this.angle * Math.PI / 180) * this.vel





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
    }

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
