// import classes
import Phaser from "phaser"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
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
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    playerSprite: Phaser.GameObjects.Sprite;
    keys: object;
    force: force;
    dir: dir;
    fow: FowLayer;
    initTimer:number;
    countdown:number;
    timerText:Phaser.GameObjects.Text;
    timerEvent:Phaser.Time.TimerEvent;
    numLevels:number;
    collectedCheckpoints:number;
    totalCheckpoints:number;
    gameSound: Phaser.Sound.BaseSound;
    clockObject: Phaser.GameObjects.Image;
    timeContainer: Phaser.GameObjects.Sprite
    timeBar: Phaser.GameObjects.Sprite
    centerX: number

    constructor(mapConfigData:ConfigData) {
        super('GameScene');
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
       
        this.load.image('clock', './assets/icons8-timer-64.png');
        this.load.audio('gameSound', './assets/race-track-sound.wav');

        this.load.image("timecontainer", "./assets/timeContainer.png");
        this.load.image("timebar", "./assets/timeBar.png");
    }

    create() {
        // var div = document.getElementById('gameContainer');
        // div.style.backgroundColor = '#bc8044';
      
        this.GameSound();

        this.mapArray = new MapArray(this.mapConfigData);
        this.tileMap = new TileMapConstruct(this, this.mapArray, this.mapConfigData)
    
        this.fow = new FowLayer(this.mapConfigData);
        this.fow.mapLayer(this, this.tileMap.tileMap);   
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras);
       
        // every 1000ms (1s) call this.onEventTimer
        this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onEventTimer, callbackScope: this, loop: true });
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;

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
        this.mainCamera();
        this.displayTimeBar(15);
        this.timerLabel();
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
        
        this.fow.calculateFow(this, this.player);

        // if timer goes to 0, switch to end scene
        if (this.countdown === 0) {
            this.scene.stop('GameScene');
            this.gameSound.destroy();
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
        if (this.countdown < 10) {
            this.timerText.setText('00:' + '0' + this.countdown);  
        } else {
            this.timerText.setText('00:' + this.countdown);
        }
        
    }

    displayTimeBar(totalTime: number) {
        this.countdown = totalTime;
    
        let timeContainer = this.add.sprite(this.centerX, 3500, "timecontainer");
        let timeBar = this.add.sprite(timeContainer.x + 46, timeContainer.y, "timebar");
 
        // a copy of the time bar to be used as a mask
        var timeMask = this.add.sprite(timeBar.x, timeBar.y, "timebar");
        timeMask.visible = false;
        timeBar.mask = new Phaser.Display.Masks.BitmapMask(this, timeMask);

        this.time.addEvent({
            delay: 1000,
            callback: function(){
 
                // dividing time bar width by the number of seconds gives us the amount
                // of pixels we need to move the time bar each second
                let stepWidth = timeMask.displayWidth / totalTime;
                
                timeMask.x -= stepWidth; // moving the mask
            },
            callbackScope: this,
            loop: true
        });
    }

    private GameSound() {
        this.gameSound = this.sound.add('gameSound');
        this.gameSound.play({
            loop: true
        });
    }

    private timerLabel() {
        this.clockObject = this.add.image(this.centerX - 250, 3700, 'clock').setDisplaySize(100, 100).setScrollFactor(0);

        this.timerText = this.add.text(
            this.centerX, 
            3700, 
            '00:' + this.countdown, 
            {
                fontStyle: "Bold", 
                fontSize: "120px", 
                color: "#ffffff"
            })
            .setOrigin(0.5)
            .setScrollFactor(0);
    }

    private mainCamera(){
        var camZoom = this.cameras.main;        
        camZoom.setBounds(0, 0, this.mapConfigData.mapWidth * this.mapConfigData.tileDimension, this.mapConfigData.mapHeight * this.mapConfigData.tileDimension);
        camZoom.zoom = 2;
        camZoom.startFollow(this.playerSprite, true, 1, 1, this.player.posX, this.player.posY);
        camZoom.followOffset.set(300, 300);
    }

    

}