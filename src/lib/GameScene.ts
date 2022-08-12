// import classes
import Phaser from "phaser"
import GenerateMap from "./GenerateMap"
import TileMapConstruct from "./TileMapConstruct"
import FowLayer from "./FowLayer"
import PlayerFactory from "./PlayerFactory"
import Checkpoints from "./Checkpoints"

// import types
import type ConfigData from "./ConfigData"
import type Player from "./Player"
import type { gameSceneData } from "./gameSceneDataType"


/**
 * GameScene creates the Phaser Scene for each level of the game, draws the Tilemap, creates the fog of war,
 * draws the player's sprite, places checkpoints on the map, and updates the scene. 
 * GameScene starts up another GameScene if all checkpoints have been collected before the timer runs out, 
 * or calls EndScene if not.
 */
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
    player: Player;
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
    mycamera: Phaser.Cameras.Scene2D.Camera

    numLevels: number;
    collectedCheckpoints: number;
    totalCheckpoints: number;
    
    centerX: number;
    gameSound: Phaser.Sound.BaseSound;
    winSound: Phaser.Sound.BaseSound;
    clockObject: Phaser.GameObjects.Image;

    /**
     * Initilizes config data
     * 
     * @param mapConfigData ConfigData object containing data about the Phaser game
     */
    constructor(mapConfigData:ConfigData) {
        super('GameScene');
        this.mapConfigData = mapConfigData;
    }

    /**
     * Initializes properties for the Scene
     * 
     * @param data gameSceneData sent in from the previous Scene
     */
    init(data: gameSceneData) {
        this.playerVehicle = data.id;
        console.log('player selected: ' + this.playerVehicle);
        this.image = data.image;
        console.log('vehicle: ' + this.image);
        this.initTimer = data.timer;
        this.countdown = data.timer;
        this.currentLevel = data.currentLevel;
        this.mycamera = new Phaser.Cameras.Scene2D.Camera(0, 0, this.mapConfigData.mapWidth, this.mapConfigData.mapHeight);

        // generate race track data
        this.mapGeneration = new GenerateMap(this.mapConfigData);

        // generate Tilemap
        this.tileMap = new TileMapConstruct(this, this.mapGeneration, this.mapConfigData)

        // resets checkpoints
        this.checkpoints = new Checkpoints(this.mapGeneration, this.mapConfigData);
        this.numLevels = data.currentLevel;

        // add input keys
        this.gasKey = this.input.keyboard.addKey(data.gasKey);
        this.brakeKey = this.input.keyboard.addKey(data.brakeKey);
        this.rightKey = this.input.keyboard.addKey(data.rightKey);
        this.leftKey = this.input.keyboard.addKey(data.leftKey);
    }

    /**
     * Preloads images for the Scene
     */
    preload() {
        // load chackpoint and finish flag image
        this.load.image('checkpoint', this.checkpoints.image);
        this.load.image('finish flag', this.checkpoints.finishFlagImage);

        // load player's vehicle image
        this.load.image(this.playerVehicle, this.image)
        // this.load.image(mapData.tileKey, mapData.tilesetImageSheet);
        this.load.spritesheet(this.mapConfigData.tileKey, this.mapConfigData.tilesetImageSheet, {frameWidth: this.mapConfigData.tileDimension, frameHeight: this.mapConfigData.tileDimension})
       
        // timer images
        this.load.image('clock', './assets/icons8-timer-64.png');
        this.load.image("timecontainer", "./assets/timeContainer.png");
        this.load.image("timebar", "./assets/timeBar.png");

        // sounds
        this.load.audio('gameSound', './assets/race-track-sound.wav');
        this.load.audio('winSound', './assets/congrats-sound.wav');
    }

    /**
     * Creates the Scene
     */
    create() {
        //sound
        this.displaySound();

        // location of center of screen width
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;
    
        // add fog of war
        this.createFow();
        
        // add current lap to game screen
        this.lapText = this.add.text(
            this.centerX - 900, 
            3700, 
            'Lap: ' + this.checkpoints.getCurrentLap() + '/' + this.checkpoints.getTotalNumLaps(), 
            {
                // fontStyle: "Bold", 
                fontSize: "120px", 
                color: "#FFFFFF"
            }
        ).setOrigin(0.5).setScrollFactor(0);

        // add current level to game screen
        this.levelText = this.add.text(
            this.centerX - 900, 
            3575, 
            'Level: ' + this.currentLevel, 
            {
                // fontStyle: "Bold", 
                fontSize: "120px", 
                color: "#FFFFFF"}
        ).setOrigin(0.5).setScrollFactor(0);

        // every 1000ms (1s) call this.onEventTimer
        this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onEventTimer, callbackScope: this, loop: true });
        
        // create player object
        let playerSelection = new PlayerFactory(this.mapGeneration, this.mapConfigData)
        this.player = playerSelection.createPlayer(this.playerVehicle)

        // add checkpoint image to scene
        this.checkpointImage = this.add.image(this.checkpoints.getCheckpointLoc()[1], this.checkpoints.getCheckpointLoc()[0], 'checkpoint');

        // create player sprite and set sprite angle
        this.playerSprite = this.add.sprite(this.player.getLocX(), this.player.getLocY(), this.playerVehicle)
        if (this.player.getHeading() == 0 || this.player.getHeading() == 180) {
            this.playerSprite.angle = this.player.getHeading() + 90
        } else if (this.player.getHeading() == 90 || this.player.getHeading() == 270) {
            this.playerSprite.angle = this.player.getHeading() - 90
        }

        // creates the camera view to follow the player's vehicle
        this.mainCamera();

        // sets up the countdown timer
        this.timerLabel(this.initTimer)
        //this.displayTimeBar(this.initTimer)
    }
    
    /**
     * Updates the Scene
     */
    update(timestep, dt) {
        // move the player object
        this.playerAngle = this.player.getHeading()
        this.player.updateLoc(this.gasKey.isDown, this.brakeKey.isDown, this.leftKey.isDown, this.rightKey.isDown, dt)
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
       
        // if timer goes to 0, switch to end scene
        if (this.countdown === 0) {
            this.scene.stop('GameScene');
            this.gameSound.destroy();
            this.scene.start('EndScene', {numLevels: (this.currentLevel - 1)});
        }
        // if all checkpoints are collected before timer runs out, load up next level
        else if(this.checkpoints.collectedAllCheckpoints() == true) {
            this.gameSound.destroy();
            this.scene.stop('GameScene');
            this.scene.start('GameScene', {
                id: this.playerVehicle, 
                image: this.image, 
                timer: this.initTimer, 
                currentLevel: (this.currentLevel + 1), 
                gasKey: this.gasKey, 
                brakeKey: this.brakeKey,
                leftKey: this.leftKey,
                rightKey: this.rightKey});
        }
    }

    /**
     * Counts down timer using Phaser logic
     */
    onEventTimer() {
        this.countdown -= 1; // one second
        this.timerText.setText(this.formatTimer())
    }

    /**
     * Formats the timer text in mm:ss
     * 
     * @returns the formatted timer text
     */
    formatTimer() {
        if(this.countdown > 59) {
            var min = Math.trunc(this.countdown / 60);
            var sec = this.countdown - (min * 60);
            if (sec < 10) {
                return '0' +  min + ':' + '0' + sec;
            } else{
                return '0' +  min + ':' + sec;
            }
        } else if (this.countdown < 10) {
            return '00:0' + this.countdown
        } else {
            return '00:' + this.countdown;
        }
    }

    /**
     * Displays a timer bar than decreases as time counts down
     * 
     * @param countdown number of seconds left for the level
     */
    displayTimeBar(countdown: number) {
        this.countdown = countdown;
        var totalTime = countdown;
    
        let timeContainer = this.add.sprite(this.centerX - 250, 3700, "timecontainer");
        let timeBar = this.add.sprite(timeContainer.x + 46, timeContainer.y, "timebar");
        
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

    /**
     * Adds the music for the Scene
     */
    private displaySound() {
        this.gameSound = this.sound.add('gameSound');
        this.gameSound.play({
            loop: true
        });
    }

    /**
     * Creates a new FowLayer, which creates the road Tilemap layer and fow layer
     */
    createFow(){
        this.fowRadius = 4; // in tiles
        this.fow = new FowLayer(this.mapConfigData, this.fowRadius);
        this.fow.mapLayer(this.tileMap.tileMap);
        this.fow.createFirstLayer(this, this.tileMap.tileMap);
    }

    /**
     * Plays a win sound
     */
    private displayWinSound() {
        this.winSound = this.sound.add('winSound');
        this.winSound.play({
            loop: false
        });
    }

    /**
     * Adds the timer text to the Scene
     * 
     * @param countdown  number of seconds left for the level
     */
    private timerLabel(countdown: number) {
        this.countdown = countdown;
        this.clockObject = this.add.image(this.centerX - 250, 3700, 'clock').setDisplaySize(100, 100).setScrollFactor(0);

        this.timerText = this.add.text(
            this.centerX, 
            3700, 
            this.formatTimer(), 
            {
                fontStyle: "Bold", 
                fontSize: "120px", 
                color: "#ffffff"
            })
            .setOrigin(0.5)
            .setScrollFactor(0);
    }

    /**
     * Creates a Phaser Camera object and sets it to follow the player's sprite
     */
    private mainCamera(){
        var camZoom = this.cameras.main;        
        camZoom.setBounds(0, 0, this.mapConfigData.mapWidth * this.mapConfigData.tileDimension, this.mapConfigData.mapHeight * this.mapConfigData.tileDimension);
        camZoom.zoom = 2;
        camZoom.startFollow(this.playerSprite, true, 1, 1, this.playerSprite.x, this.playerSprite.y);
        camZoom.followOffset.set(300, 300);
    }    
}
