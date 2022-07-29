import type ConfigData from "./ConfigData"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
import FowTexture from "./FowTexture"
import Car from "./Car"
import Phaser from "phaser"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    car: Car;
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    carSprite: Phaser.GameObjects.Sprite;
    keys: object;

    vision: Phaser.GameObjects.Graphics;
    rt: Phaser.GameObjects.RenderTexture;
    texture: FowTexture;

    gasKey: Phaser.Input.Keyboard.Key;
    brakeKey: Phaser.Input.Keyboard.Key;
    rightKey: Phaser.Input.Keyboard.Key;
    leftKey: Phaser.Input.Keyboard.Key;

    // gas: number
    // brake: number
    // right: number
    // left: number

    angleDiff: number
    carAngle: number

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
        this.carSprite = this.add.sprite(this.car.getLocX(), this.car.getLocY(), 'car')
        this.carSprite.angle = 90
        this.vision = this.texture.carMask(this, this.rt, this.car)
        this.texture.createCamera(this, this.vision)
        
        // let car = new carCharacter()
        // add car to pixel x pixel location
        // add onTrack() function to Car.js

        // add input keys
        this.gasKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.brakeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    }
    
    update() {
        // update which forces are at play
        // if (this.gasKey.isDown) {
        //     this.gas = 1
        // } else if (this.gasKey.isUp) {
        //     this.gas = 0
        // }
        // if (this.brakeKey.isDown) {
        //     this.brake = 1
        // } else if (this.brakeKey.isUp) {
        //     this.brake = 0
        // }
        // if (this.leftKey.isDown) {
        //     this.left = 1
        // } else if (this.leftKey.isUp) {
        //     this.left = 0
        // }
        // if (this.rightKey.isDown) {
        //     this.right = 1
        // } else if (this.rightKey.isUp) {
        //     this.right = 0
        // }

        // move the car object
        this.carAngle = this.car.getHeading()
        this.car.updateLoc(this.gasKey.isDown, this.brakeKey.isDown, this.leftKey.isDown, this.rightKey.isDown)
        this.angleDiff = this.carAngle - this.car.getHeading()

        // draw the sprite
        this.carSprite.setAngle(this.carSprite.angle + this.angleDiff)
        this.carSprite.setPosition(this.car.getLocX(), (-1) * this.car.getLocY());
       
        
        



        // this.car.updateDir(this.dir)
        // this.carSprite.angle -= this.car.angleDiff
        // console.log("phaser angle: " + this.carSprite.angle)
        // this.car.updateLoc(this.force)        
        // this.carSprite.setPosition(this.car.posX, this.car.posY);


        // this.car.onTrack()
        // texture.updateCarMask(this.vision, this.car);
    }
}

// export default gameScene
