import mapData from "./MapData.js"
import mapArray from "./MapArray.js"
import terrainArray from "./TerrainArray.js"

export default class Car {
    constructor() {
        // relation between car's x and y position and the mapArray is counter intuitive
        // carX is the x position on a cartesian plane (ie: the columns in mapArray)
        // carY is the y position on a cartesian plane (ie: the rows in mapArray)
        this.carX = 100,
        this.carY = 100
    }

    updateLoc() {
        // do speed calculation to find car's new pixel location?
        
        // if statement to stop the car from leaving the Phaser screen
        if (this.carX < mapData.tileDimension * mapData.mapWidth - 1) {
            this.carX += 1
        }
        if (this.carY < mapData.tileDimension * mapData.mapHeight - 1) {
            this.carY += 1
        }
    }

    onTrack() {
        this.currTile = mapArray[Math.trunc(this.carY / 128)][Math.trunc(this.carX / 128)]
        
        // logging car's position on the tilemap (not its pixel position)
        console.log("x: ", Math.trunc(this.carX / 128), " y: ", Math.trunc(this.carY / 128))

        // logs if the car is on the race track
        if (terrainArray.roadTileArray.includes(this.currTile)) {
            console.log("on track")
        }
        
        // returns true if the car is on the race track
        return (terrainArray.roadTileArray.includes(this.currTile)) 
    }
}
