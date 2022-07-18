import type ConfigData from "./ConfigData"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
import FowTexture from "./FowTexture"
import Car from "./Car"
import texture from "./FowTexture"
import Phaser from "phaser"
import type {force, dir} from "./forceDirTypes"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    car: Car;
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    carSprite: Phaser.GameObjects.Sprite;
    keys: object;
    force: force;
    dir: dir;
    vision: Phaser.GameObjects.Graphics;
    rt: Phaser.GameObjects.RenderTexture;
    texture: FowTexture

    constructor(mapConfigData:ConfigData) {
        super("GameScene");
        this.mapConfigData = mapConfigData;
    }

    preload() {
        this.load.image('car', 'assets/Cars/car_blue_small_3.png')
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(this.mapConfigData.tileKey, this.mapConfigData.tilesetImageSheet, {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension})
    }

    create() {
        // var div = document.getElementById('gameContainer');
        // div.style.backgroundColor = '#bc8044';

        this.mapArray = new MapArray(this.mapConfigData);
        this.tileMap = new TileMapConstruct(this, this.mapArray, this.mapConfigData)
        this.texture = new FowTexture(this.mapConfigData);
        this.rt = this.texture.mapTexture(this, this.tileMap.tileMap)

        this.car = new Car(this.mapArray, this.mapConfigData)
        this.carSprite = this.add.sprite(this.car.posX, this.car.posY, 'car')
        this.vision = this.texture.carMask(this, this.rt, this.car)
        this.texture.createCamera(this, this.vision)
        

        // let car = new carCharacter()
        // add car to pixel x pixel location
        // add onTrack() function to Car.js

        // add input keys
        this.keys = this.input.keyboard.addKeys({
            gas: Phaser.Input.Keyboard.KeyCodes.SPACE,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            brake: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })

        // let keys = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // type force = { w: boolean, s: boolean }
        // this.force = <force>{
        //     'w': false,
        //     's': false,
        // }

        this.force = {
            'gas': false,
            'brake': false,
        }

        this.dir = {
            'left': false,
            'right': false
        }
    }
    
    update() {
        // update which forces are at play
        if (this.keys.gas.isDown) {
            this.force.gas = true
        } else if (this.keys.gas.isUp) {
            this.force.gas = false
        }
        if (this.keys.brake.isDown) {
            this.force.brake = true
        } else if (this.keys.brake.isUp) {
            this.force.brake = false
        }
        if (this.keys.left.isDown) {
            this.dir.left = true
        } else if (this.keys.left.isUp) {
            this.dir.left = false
        }
        if (this.keys.right.isDown) {
            this.dir.right = true
        } else if (this.keys.right.isUp) {
            this.dir.right = false
        }

        this.car.updateDir(this.dir)
        this.carSprite.angle = this.car.angle + 90
        this.car.updateLoc(this.force)
        this.carSprite.setPosition(this.car.posX, this.car.posY);
        // this.car.onTrack()
        // texture.updateCarMask(this.vision, this.car);
    }
}

// export default gameScene