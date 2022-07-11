import mapData from "./MapData.js"
import tileMapConstruct from "./TileMapConstruct.js"
import Car from "./Car.js"
import texture from "./FowTexture.js"

const gameScene = {
    key: "gameScene",

    preload: function() {
        this.load.image('car', 'assets/Cars/car_blue_small_3.png')
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(mapData.tileKey, mapData.tilesetImageSheet, {frameWidth: mapData.tileDimension, frameHeight: mapData.tileDimension})
    },

    create: function() {
        this.map = tileMapConstruct.initialize(this)
        this.rt = texture.mapTexture(this, this.map)

        this.car = new Car()
        this.carSprite = this.add.sprite(this.car.posX, this.car.posY, 'car')
        this.vision = texture.carMask(this, this.rt, this.car)
        texture.createCamera(this, this.vision)
        

        // let car = new carCharacter()
        // add car to pixel x pixel location
        // add onTrack() function to Car.js

        // add input keys
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        })

        this.force = {
            'w': false,
            's': false,
        }

        this.dir = {
            'a': false,
            'd': false
        }
    },
    
    update: function() {      
        // update which forces are at play
        if (this.keys.w.isDown) {
            this.force.w = true
        } else if (this.keys.w.isUp) {
            this.force.w = false
        }
        if (this.keys.s.isDown) {
            this.force.s = true
        } else if (this.keys.s.isUp) {
            this.force.s = false
        }
        if (this.keys.a.isDown) {
            this.dir.a = true
        } else if (this.keys.a.isUp) {
            this.dir.a = false
        }
        if (this.keys.d.isDown) {
            this.dir.d = true
        } else if (this.keys.d.isUp) {
            this.dir.d = false
        }

        this.car.updateDir(this.dir)
        this.carSprite.angle = this.car.angle + 90
        this.car.updateLoc(this.force)
        this.carSprite.setPosition(this.car.posX, this.car.posY);
        this.car.onTrack()
        texture.updateCarMask(this.vision, this.car);
    }
}

export default gameScene