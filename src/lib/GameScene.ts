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
import type { gameSceneData } from "./GameSceneDataType"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    mapGeneration: GenerateMap;
    tileMap: TileMapConstruct;

    fow: FowLayer;
    vision: Phaser.GameObjects.Graphics;
    fowRadius: number;

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
    levelText: Phaser.GameObjects.Text;

    constructor(mapConfigData:ConfigData) {
        super("GameScene");
        this.mapConfigData = mapConfigData;
    }

    init(data: gameSceneData) {
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
<<<<<<< HEAD

        this.totalCheckpoints = this.checkpoints.getTotalNumCheckpoints();
        this.collectedCheckpoints = 3;
        this.currentCheckpoint = this.checkpoints.getCheckpoint();

        this.totalLaps = this.checkpoints.getTotalNumLaps();
        this.currentLap = 1;
||||||| 85113fe

        this.totalCheckpoints = this.checkpoints.getTotalNumCheckpoints();
        this.collectedCheckpoints = 0;
        this.currentCheckpoint = this.checkpoints.getCheckpoint();

        this.totalLaps = this.checkpoints.getTotalNumLaps();
        this.currentLap = 1;
=======
>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c
    }

    preload() {
        // load chackpoint and finish flag image
        this.load.image('checkpoint', this.checkpoints.image);
        this.load.image('finish flag', this.checkpoints.finishFlagImage);

        // load player's vehicle image
        this.load.image(this.playerVehicle, this.image)
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(this.mapConfigData.tileKey, this.mapConfigData.tilesetImageSheet, {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension})
        this.load.spritesheet('blackTile', './assets/black.png',  {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension} );

        this.load.image('testing', './assets/svelte.png')

    }

    create() {
       

        this.fow = new FowLayer(this.mapConfigData);
        
        this.fow.mapLayer(this, this.tileMap.tileMap);

        this.myMap = this.tileMap.createLayerMap();

        
       
        /*
        
        this.layer = this.add.layer(this.add.image(1000, 1000, 'testing')).setDepth(200); 
        this.make.layer(this.layer, true);

        this.add.image(200, 200, 'testing').addToDisplayList;

        // add fog of war
<<<<<<< HEAD
        this.fow = new FowLayer(this.mapConfigData);
        //const mySprite = this.make.sprite()//dd.sprite(200, 200, 'testing'); //.setDepth(20);
        
||||||| 85113fe
        this.fow = new FowLayer(this.mapConfigData);
=======
        this.fowRadius = 4; // in tiles
        this.fow = new FowLayer(this.mapConfigData, this.fowRadius);
>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c
        this.fow.mapLayer(this, this.tileMap.tileMap);
<<<<<<< HEAD
        
        this.add.image(200, 200, 'testing').setDepth(20);
        
        this.add.image(400, 400, 'testing').setDepth(20);
        this.myMap = this.tileMap.createLayerMap(); //new TileMapConstruct(this, this.mapGeneration, this.mapConfigData);  //WARNING: if I call this inside init, it doesn't work!

        var graphics = this.add.graphics();
        graphics.addToUpdateList;

        //this.rt = this.make.renderTexture(this.myMap, true);

        //this.rt.draw(this.myMap, 200, 0);//.setDepth(500);
        //const mySprite = new Phaser.GameObjects.Sprite(this, 400, 800)

        //this.rt.draw(mySprite, 200, 900).setDepth(200)

        //this.rt.alpha = 0.5
        */
        
        
        //this.myMap //.alpha = 0.1;

        //this.add.image(600, 600, 'testing').setDepth(20) //setAlpha(0.2);
        // this.layer.add(this.testing)

        // this.layer = this.add.layer(this.add.image(1000, 1000, 'testing')); 
        // this.layer.setDepth(20)
        

        //var rt = this.mapLayer.renderTexture(0, 0, 800, 600);
        

        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras);
||||||| 85113fe
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras);
=======
        this.fow.cameraFow(this, this.tileMap.tileMap, this.cameras); 
>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c

        //this.add.image(800, 800, 'testing').setAlpha(0.5).setDepth(20);


        // add checkpoint image
        this.checkpointImage = this.add.image(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0], 'checkpoint').setScale(1.5);


        // add current lap to game screen
        this.lapText = this.add.text(450, 150, 'Lap: ' + this.checkpoints.getCurrentLap() + '/' + this.checkpoints.getTotalNumLaps(), {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5);

        // add current level to game screen
        this.levelText = this.add.text(450, 250, 'Level: ' + this.currentLevel, {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5);

        // add timer 
        this.timerText = this.add.text(500, 50, 'Timer: ' + this.countdown, {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5).setDepth(20);
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

<<<<<<< HEAD
||||||| 85113fe
        // add checkpoint image
        this.checkpointImage = this.add.image(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0], 'checkpoint').setScale(1.5);

=======
        // add checkpoint image to scene
        this.checkpointImage = this.add.image(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0], 'checkpoint').setScale(1.5);
        console.log("checkpoint:", this.checkpoints.getCheckpointCoordinate());

>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c
        // create player sprite
        this.playerSprite = this.add.sprite(this.player.getLocX(), this.player.getLocY(), this.playerVehicle).setDepth(110)
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
        this.fow.calculateFow(this, this.player);

        // set checkpoint visibility
        if (this.checkpoints.isVisible(this.player, this.fowRadius)) {
            this.checkpointImage.setVisible(true);
        }
        else {
            this.checkpointImage.setVisible(false);
        }

        // check if player reached checkpoint, place the next checkpoint on the track
        if (this.checkpoints.updateCheckpoint(this.player)) {
            // change checkpoint image to a flag for the last checkpoint
            if (this.checkpoints.onLastCheckpoint()) {
                this.checkpointImage.setTexture('finish flag');
            }

            // updates lap text if user completes a lap of the track
            if (this.checkpoints.changeLap()) {
                this.lapText.setText('Lap: ' + this.checkpoints.getCurrentLap() + '/' + this.checkpoints.getTotalNumLaps());
            }

            // change checkpoint location
            this.checkpointImage.setPosition(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0]).setVisible(false);
            console.log("new checkpoint:", this.checkpoints.getCheckpointCoordinate());
        }
<<<<<<< HEAD
        
        // fow update
        this.fow.calculateFow(this, this.player, this.checkpointImage);
||||||| 85113fe
        
        // fow update
        this.fow.calculateFow(this, this.player);
=======
>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c
       
        // if timer goes to 0, switch to end scene
        if (this.countdown < 0) {
            this.scene.stop('GameScene');
            this.scene.start('EndScene', {numLevels: (this.currentLevel - 1)});
        }
        // if all checkpoints are collected before timer runs out, load up next level
<<<<<<< HEAD
        else if(this.collectedAllCheckpoints() == true) {
            this.scene.start('GameScene', {
                id: this.playerVehicle, 
                image: this.image, 
                timer: this.initTimer, 
                numLevels: this.currentLevel + 1});
        }
    }

    // checks if all checkpoints has been collected
    collectedAllCheckpoints() {
        if (this.collectedCheckpoints == this.totalCheckpoints) {
            return true;
||||||| 85113fe
        else if(this.collectedAllCheckpoints() == true) {
            this.scene.start('GameScene', {id: this.playerVehicle, image: this.image, timer: this.initTimer, numLevels: this.currentLevel + 1});
        }
    }

    // checks if all checkpoints has been collected
    collectedAllCheckpoints() {
        if (this.collectedCheckpoints == this.totalCheckpoints) {
            return true;
=======
        else if(this.checkpoints.collectedAllCheckpoints() == true) {
            this.scene.stop('GameScene');
            this.scene.start('GameScene', {id: this.playerVehicle, image: this.image, timer: this.initTimer, currentLevel: (this.currentLevel + 1)});
>>>>>>> 828469589767a164beab1ad02ab24903c36f2a4c
        }
    }

    // counts down timer using Phaser logic
    onEventTimer() {
        this.countdown -= 1; // one second
        this.timerText.setText('Timer: ' + this.countdown);
    }
}
