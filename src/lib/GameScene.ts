import type ConfigData from "./ConfigData"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
//import FowTexture from "./FowTexture"
import Car from "./Car"
import texture from "./FowTexture"
import Phaser from "phaser"
import type {force, dir} from "./forceDirTypes"
//import CarKeys from "./CarKeys"
import FowLayer from "./FowLayer"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    car: Car;
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    carSprite: Phaser.GameObjects.Sprite;
    keys: Phaser.Input.InputPlugin;
    force: force;
    dir: dir;
    vision: Phaser.GameObjects.Graphics;
    rt: Phaser.GameObjects.RenderTexture;
    //texture: FowTexture
    fow: FowLayer

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

        this.fow = new FowLayer(this.mapConfigData);

        this.fow.mapLayer(this, this.tileMap.tileMap);
        
        //this.rt = this.texture.mapTexture(this, this.tileMap.tileMap)


        this.car = new Car(this.mapArray, this.mapConfigData)
        this.carSprite = this.add.sprite(this.car.posX, this.car.posY, 'car')

        //this.vision = this.texture.carMask(this, this.rt, this.car)
        //this.texture.createCamera(this, this.vision)
        

        // let car = new carCharacter()
        // add car to pixel x pixel location
        // add onTrack() function to Car.js

        // add input keys
        //this.keys = this.input.keyboard.addKeys({ 
        
        // let keys = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // type force = { w: boolean, s: boolean }
        // this.force = <force>{
        //     'w': false,
        //     's': false,
        // }

        this.force = {
            'w': false,
            's': false,
        }

        this.dir = {
            'a': false,
            'd': false
        }
    }

    
    update() {
       var w = this.input.keyboard.addKey('w');
       var s = this.input.keyboard.addKey('s');
       var a = this.input.keyboard.addKey('a');
       var d = this.input.keyboard.addKey('d');

        if (w.isDown) {
            this.force.w = true
        } else if (w.isUp) {
            this.force.w = false
        }
        if (s.isDown) {
            this.force.s = true
        } else if (s.isUp) {
            this.force.s = false
        }
        if (a.isDown) {
            this.dir.a = true
        } else if (a.isUp) {
            this.dir.a = false
        }
        if (d.isDown) {
            this.dir.d = true
        } else if (d.isUp) {
            this.dir.d = false
        }

        

        /*
        if (this.input.keyboard.addKey('w').isDown) {
            this.force.w = true
        } else if (this.keys.keyboard.isUp) {
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
        */
        

        this.car.updateDir(this.dir)
        this.carSprite.angle = this.car.angle + 90
        this.car.updateLoc(this.force)
        this.carSprite.setPosition(this.car.posX, this.car.posY);
        // this.car.onTrack()
        //this.texture.updateCarMask(this.car);

        //this.fow = new FowLayer(this.mapConfigData);
        

        
        
    }
}

// export default gameScene