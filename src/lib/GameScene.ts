// import classes
import Phaser from "phaser"
import GenerateMap from "./GenerateMap"
import TileMapConstruct from "./TileMapConstruct"
import FowLayer from "./FowLayer"
import Car from "./Car"
import Bike from "./Bike"
import Checkpoints from "./Checkpoints"

// import types
import type ConfigData from "./ConfigData"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    mapGeneration: GenerateMap;
    tileMap: TileMapConstruct;

    fow: FowLayer;
    vision: Phaser.GameObjects.Graphics;

    checkpointLayer: Phaser.GameObjects.Layer;

    image: string;
    playerVehicle: string;
    player: Bike | Car;
    playerSprite: Phaser.GameObjects.Sprite;
    angleDiff: number;
    playerAngle: number;
    
    gasKey: Phaser.Input.Keyboard.Key;
    brakeKey: Phaser.Input.Keyboard.Key;
    rightKey: Phaser.Input.Keyboard.Key;
    leftKey: Phaser.Input.Keyboard.Key;

    timerText: Phaser.GameObjects.Text;
    timerEvent: Phaser.Time.TimerEvent;
    initTimer: number;
    countdown: number;

    currentLevel: number;

    checkpoints: Checkpoints;
    checkpointImage: Phaser.GameObjects.Image;

    lapText: Phaser.GameObjects.Text;

    constructor(mapConfigData:ConfigData) {
        super("GameScene");
        this.mapConfigData = mapConfigData;
    }

    init(data: any) {
        this.playerVehicle = data.id;
        console.log('player selected: ' + this.playerVehicle);
        this.image = data.image;
        console.log('vehicle: ' + this.image);
        this.initTimer = data.timer;
        this.countdown = data.timer;
        this.currentLevel = data.currentLevel;

        // generate race track
        this.mapGeneration = new GenerateMap(this.mapConfigData);
        this.tileMap = new TileMapConstruct(this, this.mapGeneration, this.mapConfigData)

        // resets checkpoints
        this.checkpoints = new Checkpoints(this.mapGeneration, this.mapConfigData);

    }

    preload() {
        // load chackpoint and finish flag image
        this.load.image('checkpoint', this.checkpoints.image);
        this.load.image('finish flag', this.checkpoints.finishFlagImage);

        // load player's vehicle image
        this.load.image(this.playerVehicle, this.image)
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(this.mapConfigData.tileKey, this.mapConfigData.tilesetImageSheet, {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension})
        
    }

    create() {
        // add fog of war
        this.fow = new FowLayer(this.mapConfigData);
        this.fow.mapLayer(this, this.tileMap.tileMap);
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras); 

        // add current lap to game screen
        this.lapText = this.add.text(450, 150, 'Lap: ' + this.checkpoints.getCurrentLap() + '/' + this.checkpoints.getTotalNumLaps(), {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5);

        // add timer 
        this.timerText = this.add.text(500, 50, 'Timer: ' + this.countdown, {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5);
        // every 1000ms (1s) call this.onEventTimer to update the timer
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

        // create checkpoint layer and add checkpoint image
        this.checkpointLayer = this.add.layer();
        this.checkpointLayer.setVisible(false);
        this.checkpointImage = this.add.image(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0], 'checkpoint').setScale(1.5);
        this.checkpointLayer.add(this.checkpointImage);


        // create player sprite
        this.playerSprite = this.add.sprite(this.player.getLocX(), this.player.getLocY(), this.playerVehicle)
        this.playerSprite.angle = 90
    }
    
    update() {
        // move the player object
        this.playerAngle = this.player.getHeading()
        this.player.updateLoc(this.gasKey.isDown, this.brakeKey.isDown, this.leftKey.isDown, this.rightKey.isDown)
        this.angleDiff = this.playerAngle - this.player.getHeading()

        // draw the sprite
        this.playerSprite.setAngle(this.playerSprite.angle + this.angleDiff)
        this.playerSprite.setPosition(this.player.getLocX(), (-1) * this.player.getLocY());
        
        // fow update
        this.fow.calculateFow(this, this.player, this.checkpointLayer);

        // check if player reached checkpoint, place the next checkpoint on the track
        if (this.checkpoints.updateCheckpoint(this.player)) {
            // this.collectedCheckpoints++;

            // change checkpoint image to a flag for the last checkpoint
            if (this.checkpoints.onLastCheckpoint()) {
                this.checkpointImage.setTexture('finish flag');
            }

            // updates lap text if user completes a lap of the track
            if (this.checkpoints.changeLap()) {
                this.lapText.setText('Lap: ' + this.checkpoints.getCurrentLap() + '/' + this.checkpoints.getTotalNumLaps());
            }

            // change checkpoint location
            // this.checkpointLayer.setVisible(false);
            this.checkpointImage.setPosition(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0]);
        }
       
        // if timer goes to 0, switch to end scene
        if (this.countdown < 0) {
            this.scene.stop('GameScene');
            this.scene.start('EndScene', {numLevels: this.currentLevel});
        }
        // if all checkpoints are collected before timer runs out, load up next level
        else if(this.checkpoints.collectedAllCheckpoints() == true) {
            this.scene.start('GameScene', {id: this.playerVehicle, image: this.image, timer: this.initTimer, numLevels: this.currentLevel + 1});
        }
    }

    // counts down timer using Phaser logic
    onEventTimer() {
        this.countdown -= 1; // one second
        this.timerText.setText('Timer: ' + this.countdown);
    }
}
