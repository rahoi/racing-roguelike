import Phaser from "phaser"
import type ConfigData from "./ConfigData"

export default class BindingsScene extends Phaser.Scene {

    mapConfigData: ConfigData;
    doneText: Phaser.GameObjects.Text;
    gasText: Phaser.GameObjects.Text;
    brakeText: Phaser.GameObjects.Text;
    leftText: Phaser.GameObjects.Text;
    rightText: Phaser.GameObjects.Text;
    keyMap: Map<Phaser.GameObjects.Text, string>;
    gasKey: string;
    brakeKey: string;
    leftKey: string;
    rightKey: string;
    pressedKey: string;

    constructor(mapConfigData: ConfigData) {
        super("BindingsScene");
        this.mapConfigData = mapConfigData;
    }

    create() {
        // default key bindings
        this.gasKey = 'SPACE'
        this.brakeKey = 'S'
        this.leftKey = 'A'
        this.rightKey = 'D'

        // add scene title
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                1200, 'Key Binding Options', {fontSize: '200px'}).setOrigin(0.5, 0.5)

        // add key descriptors
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 3,
                1800, 'Gas:', {fontSize: '180px'})
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 3,
                2300, 'Brake:', {fontSize: '180px'})
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 3,
                2800, 'Left:', {fontSize: '180px'})
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 3,
                3300, 'Right:', {fontSize: '180px'})

        // create text key variables
        this.gasText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.75,
                1800, this.gasKey, {fontSize: '180px'})
        this.brakeText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.75,
                2300, this.brakeKey, {fontSize: '180px'})
        this.leftText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.75,
                2800, this.leftKey, {fontSize: '180px'})
        this.rightText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.75,
                3300, this.rightKey, {fontSize: '180px'})
        
        // add text keys to map with default values
        this.keyMap = new Map;
        this.keyMap.set(this.gasText, this.gasKey)
        this.keyMap.set(this.brakeText, this.brakeKey)
        this.keyMap.set(this.leftText, this.leftKey)
        this.keyMap.set(this.rightText, this.rightKey)

        // make text keys interactive
        this.keyMap.forEach( (value, key) => {
            console.log(key)
            key.setInteractive()
            key.on('pointerover', () => {
                // this.keyMap.forEach( (otherValue, otherKey) => {
                //     otherKey.setScale(1)
                // })
                this.scale.updateBounds()
                key.setScale(1.3)
            })
            key.on('pointerout', () => {
                this.scale.updateBounds()
                key.setScale(1)
            })
            key.on('pointerdown', () => {
                this.scale.updateBounds()
                //key.setScale(1.3)
                this.input.keyboard.once('keydown', (event) => {
                    this.input.keyboard.addCapture(event.keyCode) // key will not affect the browser
                    this.pressedKey = event.key
                    if (event.key == ' ') {
                        this.pressedKey = 'SPACE'
                    }
                    this.pressedKey = this.pressedKey.toUpperCase()
                    // set key in map and in text overlay
                    this.keyMap.set(key, this.pressedKey)
                    key.setText(this.pressedKey)
                    //key.setScale(1)
                })
            })
            
        })

        // back to start scene
        this.doneText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension - 480,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension - 300,
                'Done', {fontSize: '180px'}).setOrigin(0.5, 0.5)
        this.doneText.setInteractive()
        this.doneText.on('pointerover', () => {
            this.scale.updateBounds()
            this.doneText.setScale(1.2)
        })
        this.doneText.on('pointerout', () => {
            this.scale.updateBounds()
            this.doneText.setScale(1)
        })
        this.doneText.on('pointerdown', () => {
            this.scale.updateBounds()
            this.scene.stop('BindingsScene');
            this.scene.start('StartScene', {
                gasKey: this.keyMap.get(this.gasText),
                brakeKey: this.keyMap.get(this.brakeText),
                leftKey: this.keyMap.get(this.leftText),
                rightKey: this.keyMap.get(this.rightText)
            });
        })
    }
}
