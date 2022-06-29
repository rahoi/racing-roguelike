import mapData from "./MapData.js"
import tileMapConstruct from "./TileMapConstruct.js"
import Car from "./Car.js"

const gameScene = {
    key: "gameScene",

    preload: function() {
        this.load.image('car', 'assets/Cars/car_blue_small_3.png')
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(mapData.tileKey, mapData.tilesetImageSheet, {frameWidth: mapData.tileDimension, frameHeight: mapData.tileDimension})
    },

    create: function() {
        tileMapConstruct.initialize(this)

        this.car = new Car()
        this.carSprite = this.add.sprite(this.car.carX, this.car.carY, 'car')
        // let car = new carCharacter()
        // add car to pixel x pixel location
        // add onTrack() function to Car.js
    },
    
    update: function() {
        // car.updateLoc()
        // redraw/place the car

        this.car.updateLoc()
        this.carSprite.setPosition(this.car.carX, this.car.carY);
        this.car.onTrack()
    }
}

export default gameScene