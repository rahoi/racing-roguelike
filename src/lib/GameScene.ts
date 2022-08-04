// import classes
import type ConfigData from "./ConfigData"
import MapArray from "./MapArray"
import TileMapConstruct from "./TileMapConstruct"
import FowTexture from "./FowTexture"
import Car from "./Car"
import Phaser from "phaser"

export default class GameScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    mapArray: MapArray;
    tileMap: TileMapConstruct;
    player: Car;
    playerSprite: Phaser.GameObjects.Sprite;
    vision: Phaser.GameObjects.Graphics;
    rt: Phaser.GameObjects.RenderTexture;
    texture: FowTexture;
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
    
    constructor(mapConfigData:ConfigData) {
        super("GameScene");
        this.mapConfigData = mapConfigData;
    }

    preload() {
        this.load.image('car', 'assets/Cars/car_blue_3.png')
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

        // add input keys
        this.gasKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.brakeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        
        this.player = new Car(this.mapArray, this.mapConfigData)

        // create player sprite
        this.playerSprite = this.add.sprite(this.player.getLocX(), this.player.getLocY(), 'car')
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
    }
}
