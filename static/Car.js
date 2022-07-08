import mapData from "./MapData.js"
import mapArray from "./MapArray.js"
import terrainArray from "./TerrainArray.js"

export default class Car {
    constructor() {
        // relation between car's x and y position and the mapArray is counter intuitive
        // posX is the x position on a cartesian plane (ie: the columns in mapArray)
        // posY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.posX = 100,
        this.posY = 100,
        this.speed = 0,
        this.acc = 0.10,
        this.maxSpeed = 10
        this.angle = 0
        this.rotate = 2.5
        this.brakePower = 0.5
        this.stall = 0
    }

    updateDir(dir) {
        if (dir.d && this.speed != 0) {
            this.angle += this.rotate
        } else if (dir.a && this.speed != 0) {
            this.angle -= this.rotate
        }
    }

    updateLoc(force) {
        if (force.s) { // braking
            if (this.speed > 0) {
                this.speed -= this.brakePower
            }
            if (this.speed <= 0 && this.stall < 10) { // coming to a stop
                this.speed = 0
                this.stall++
            } else { // reversing
                this.speed -= this.acc
                if (Math.abs(this.speed) > this.maxSpeed) {
                    this.speed = this.maxSpeed * -1
                }
            }
            this.updateMap()
        } else if (force.w) { // accelerating
            this.speed += this.acc
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed
            }
            this.updateMap()
            this.stall = 0
        } else if (!force.w) { // coasting
            if (this.speed > 0) { // moving forward
                this.speed -= (this.acc * 2)
                if (this.speed < 0) { // coming to a stop
                    this.speed = 0
                }
            }
            if (this.speed < 0) { // moving backwards
                this.speed += (this.acc * 2)
            }
            this.updateMap()
            this.stall = 0
        }
    }

    updateMap() {
        this.posX += Math.cos(this.angle * Math.PI / 180) * this.speed
        this.posY += Math.sin(this.angle * Math.PI / 180) * this.speed
        
        if (this.posX < 32) {
            this.speed = 0
            this.posX = 32
        } else if (this.posX > mapData.tileDimension * mapData.mapWidth - 32) {
            this.speed = 0
            this.posX = mapData.tileDimension * mapData.mapWidth - 32
        }

        if (this.posY < 32) {
            this.speed = 0
            this.posY = 32
        } else if (this.posY > mapData.tileDimension * mapData.mapHeight - 48) {
            this.speed = 0
            this.posY = mapData.tileDimension * mapData.mapHeight - 48
        }
    }

    onTrack() {
        this.currTile = mapArray[Math.trunc(this.posY / 128)][Math.trunc(this.posX / 128)]
        
        // logging car's position on the tilemap (not its pixel position)
        console.log("x: ", Math.trunc(this.posX / 128), " y: ", Math.trunc(this.posY / 128))

        // logs if the car is on the race track
        if (terrainArray.roadTileArray.includes(this.currTile)) {
            console.log("on track")
        }
        
        // returns true if the car is on the race track
        return (terrainArray.roadTileArray.includes(this.currTile)) 
    }
}
