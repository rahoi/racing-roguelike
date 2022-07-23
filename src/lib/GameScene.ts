// import classes
import Phaser from "phaser"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
import FowTexture from "./FowTexture"
import Car from "./Car"
import Bike from "./Bike"

// import types
import type ConfigData from "./ConfigData"
import type {force, dir} from "./forceDirTypes"

export default class GameScene extends Phaser.Scene {
    playerVehicle: string;
    image: string;
    mapConfigData: ConfigData;
    player: Bike | Car;
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    playerSprite: Phaser.GameObjects.Sprite;
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

    init(data: any) {
        this.playerVehicle = data.id;
        console.log('player selected: ' + this.playerVehicle);
        this.image = data.image
        console.log('vehicle: ' + this.image);
    }

    preload() {
        this.load.image(this.playerVehicle, this.image)
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

        // create player vehicle class
        switch (this.playerVehicle) {
            case 'car': {
                this.player = new Car(this.mapArray, this.mapConfigData)
                break;
            }
            case 'bike': {
                this.player = new Bike(this.mapArray, this.mapConfigData)
                break;
            }
        }
        
        this.playerSprite = this.add.sprite(this.player.posX, this.player.posY, this.playerVehicle)
        this.vision = this.texture.playerMask(this, this.rt, this.player)
        this.texture.createCamera(this, this.vision)

        // add input keys
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        })

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

        this.player.updateDir(this.dir)
        this.playerSprite.angle = this.player.angle + 90
        this.player.updateLoc(this.force)
        this.playerSprite.setPosition(this.player.posX, this.player.posY);
        // this.car.onTrack()
        // texture.updateCarMask(this.vision, this.car);
    }
}

// export default gameScene