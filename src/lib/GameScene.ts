// import classes
import Phaser from "phaser"
import GenerateMap from "./GenerateMap"
import TileMapConstruct from "./TileMapConstruct"
// import FowTexture from "./FowTexture"
import Car from "./Car"
import Bike from "./Bike"

// import types
import type ConfigData from "./ConfigData"
import type {force, dir} from "./forceDirTypes"
import FowLayer from "./FowLayer"

export default class GameScene extends Phaser.Scene {
    playerVehicle: string;
    image: string;
    mapConfigData: ConfigData;
    player: Bike | Car;
    mapGeneration: GenerateMap;
    tileMap: TileMapConstruct;
    playerSprite: Phaser.GameObjects.Sprite;
    keys: object;
    force: force;
    dir: dir;
    vision: Phaser.GameObjects.Graphics;
    rt: Phaser.GameObjects.RenderTexture;
    fow: FowLayer;
    initTimer:number;
    countdown:number;
    timerText:Phaser.GameObjects.Text;
    timerEvent:Phaser.Time.TimerEvent;
    numLevels:number;
    collectedCheckpoints:number;
    totalCheckpoints:number;

    constructor(mapConfigData:ConfigData) {
        super("GameScene");
        this.mapConfigData = mapConfigData;

        // resets checkpoints
        this.collectedCheckpoints = 0;
        this.totalCheckpoints = 1;

    }

    init(data: any) {
        this.playerVehicle = data.id;
        console.log('player selected: ' + this.playerVehicle);
        this.image = data.image;
        console.log('vehicle: ' + this.image);
        this.initTimer = data.timer;
        this.countdown = data.timer;
        this.numLevels = data.numLevels;
    }

    preload() {
        this.load.image(this.playerVehicle, this.image)
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(this.mapConfigData.tileKey, this.mapConfigData.tilesetImageSheet, {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension})
        
        // add sprite oil spill
        this.load.image('oil', 'assets/oilSpill.png');
    }

    create() {
        // var div = document.getElementById('gameContainer');
        // div.style.backgroundColor = '#bc8044';

        this.timerText = this.add.text(32, 32, 'Timer: ' + this.countdown, {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5);

        // every 1000ms (1s) call this.onEventTimer
        this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onEventTimer, callbackScope: this, loop: true });

        this.mapGeneration = new GenerateMap(this.mapConfigData);
        this.tileMap = new TileMapConstruct(this, this.mapGeneration, this.mapConfigData)
    
        this.fow = new FowLayer(this.mapConfigData);
        this.fow.mapLayer(this, this.tileMap.tileMap);   
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras);

        // create player vehicle class
        switch (this.playerVehicle) {
            case 'car': {
                this.player = new Car(this.mapGeneration, this.mapConfigData)
                break;
            }
            case 'bike': {
                this.player = new Bike(this.mapGeneration, this.mapConfigData)
                break;
            }
        }
        
        this.playerSprite = this.add.sprite(this.player.posX, this.player.posY, this.playerVehicle)
       
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
        this.fow.calculateFow(this, this.player);

        // if timer goes to 0, switch to end scene
        if (this.countdown < 0) {
            this.scene.stop('GameScene');
            this.scene.start('EndScene', {numLevels: this.numLevels});
        }
        // if all checkpoints are collected before timer runs out, load up next level
        else if(this.collectedAllCheckpoints() == true) {
            this.scene.start('GameScene', {id: this.playerVehicle, image: this.image, timer: this.initTimer, numLevels: this.numLevels + 1});
        }
  
    }

    // checks if all checkpoints has been collected
    collectedAllCheckpoints() {
        if (this.collectedCheckpoints == this.totalCheckpoints) {
            return true;
        }
        return false;
    }

    // counts down timer using Phaser logic
    onEventTimer() {
        this.countdown -= 1; // one second
        this.timerText.setText('Timer: ' + this.countdown);
    }
}