// import classes
import Phaser from "phaser"
import GenerateMap from "./GenerateMap"
import TileMapConstruct from "./TileMapConstruct"
import FowLayer from "./FowLayer"
import Car from "./Car"
import Bike from "./Bike"

// import types
import type ConfigData from "./ConfigData"

export default class GameScene extends Phaser.Scene {
    image: string;
    playerVehicle: string;
    mapConfigData: ConfigData;
    mapGeneration: GenerateMap;
    tileMap: TileMapConstruct;
    fow: FowLayer;
    player: Bike | Car;
    playerSprite: Phaser.GameObjects.Sprite;
    vision: Phaser.GameObjects.Graphics;
    gasKey: Phaser.Input.Keyboard.Key;
    brakeKey: Phaser.Input.Keyboard.Key;
    rightKey: Phaser.Input.Keyboard.Key;
    leftKey: Phaser.Input.Keyboard.Key;
    timerText:Phaser.GameObjects.Text;
    timerEvent:Phaser.Time.TimerEvent;
    angleDiff: number;
    playerAngle: number;
    initTimer: number;
    countdown: number;
    numLevels: number;
    collectedCheckpoints: number;
    totalCheckpoints: number;
    centerX: number;
    gameSound: Phaser.Sound.BaseSound;
    winSound: Phaser.Sound.BaseSound;
    clockObject: Phaser.GameObjects.Image;

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
        this.load.audio('winSound', './assets/congrats-sound.wav');

        this.load.image("timecontainer", "./assets/timeContainer.png");
        this.load.image("timebar", "./assets/timeBar.png");
    }

    create() {
        // var div = document.getElementById('gameContainer');
        // div.style.backgroundColor = '#bc8044';

        //sound
        this.displaySound();

        // generate race track
        this.mapGeneration = new GenerateMap(this.mapConfigData);
        this.tileMap = new TileMapConstruct(this, this.mapGeneration, this.mapConfigData)
    
        // add fog of war
       this.generateFow();
       
        // every 1000ms (1s) call this.onEventTimer
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;

        // every 1000ms (1s) call this.onEventTimer
        this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onEventTimer, callbackScope: this, loop: true });

        // add input keys
        this.gasKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.brakeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        
        // create player object
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

        // create player sprite
        this.playerSprite = this.add.sprite(this.player.getLocX(), this.player.getLocY(), this.playerVehicle)
        this.playerSprite.angle = 90

        this.mainCamera();
        this.timerLabel(this.initTimer);
        this.displayTimeBar(this.initTimer);
    }
    
    update() {
        // move the player object
        this.playerAngle = this.player.getHeading()
        this.player.updateLoc(this.gasKey.isDown, this.brakeKey.isDown, this.leftKey.isDown, this.rightKey.isDown)
        this.angleDiff = this.playerAngle - this.player.getHeading()

        // draw the sprite
        this.playerSprite.setAngle(this.playerSprite.angle + this.angleDiff)
        this.playerSprite.setPosition(this.player.getLocX(), (-1) * this.player.getLocY());

        // this.car.onTrack()
        // fow update
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

    displayTimeBar(countdown: number) {
        this.countdown = countdown;
        var totalTime = countdown;
    
        //let timeContainer = this.add.sprite(this.centerX - 250, 3700, "timecontainer");
        //let timeBar = this.add.sprite(timeContainer.x + 46, timeContainer.y, "timebar");
        
        let timeBar = this.add.sprite(this.centerX - 250, 3700, "timebar").setScrollFactor(0);

        // a copy of the time bar as a mask
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

    private displaySound() {
        this.gameSound = this.sound.add('gameSound');
        this.gameSound.play({
            loop: true
        });
    }

    private displayWinSound() {
        this.winSound = this.sound.add('winSound');
        this.winSound.play({
            loop: false
        });
    }


    private timerLabel(countdown: number) {
        this.countdown = countdown;
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
        camZoom.startFollow(this.playerSprite, true, 1, 1, this.playerSprite.x, this.playerSprite.y);
        camZoom.followOffset.set(300, 300);
    }

    private generateFow(){
        this.fow = new FowLayer(this.mapConfigData);
        this.fow.mapLayer(this, this.tileMap.tileMap);        
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras);
    }

    

}
