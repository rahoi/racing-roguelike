import Phaser, { Plugins, Tilemaps, Tweens } from "phaser"
import type ConfigData from "./ConfigData"

export default class BindingsScene extends Phaser.Scene {

    mapConfigData: ConfigData;
    doneText: Phaser.GameObjects.Text;
    duplicateText: Phaser.GameObjects.Text;
    invalidText: Phaser.GameObjects.Text;
    missingText: Phaser.GameObjects.Text;
    gasText: Phaser.GameObjects.Text;
    brakeText: Phaser.GameObjects.Text;
    leftText: Phaser.GameObjects.Text;
    rightText: Phaser.GameObjects.Text;
    bindsArr: Phaser.GameObjects.Text[];
    flashMap: Map<Phaser.GameObjects.Text, Tweens.Tween>;
    gasKey: string;
    brakeKey: string;
    leftKey: string;
    rightKey: string;
    pressedKey: string;
    
    constructor(mapConfigData: ConfigData) {
        super("BindingsScene");
        this.mapConfigData = mapConfigData;
    }

    init(data: any) {
        // set keys
        this.gasKey = data.gasKey
        this.brakeKey = data.brakeKey
        this.leftKey = data.leftKey
        this.rightKey = data.rightKey
    }

    create() {
        // create text objects
        this.duplicateText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                    this.mapConfigData.mapHeight * this.mapConfigData.tileDimension - 900,
                    'Key bind already in use, please select another.', {fontSize: '125px'})
                    .setColor('#ff0000').setOrigin(0.5, 0.5).setVisible(false)
        this.invalidText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                    this.mapConfigData.mapHeight * this.mapConfigData.tileDimension - 900,
                    'Invalid key, please select a valid bind.', {fontSize: '125px'})
                    .setColor('#ff0000').setOrigin(0.5, 0.5).setVisible(false)
        this.missingText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                    this.mapConfigData.mapHeight * this.mapConfigData.tileDimension - 900,
                    'Please select a valid key binding for all keys.', {fontSize: '125px'})
                    .setColor('#ff0000').setOrigin(0.5, 0.5).setVisible(false)

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
        this.bindsArr = [];
        this.bindsArr.push(this.gasText)
        this.bindsArr.push(this.brakeText)
        this.bindsArr.push(this.leftText)
        this.bindsArr.push(this.rightText)

        // set up flash tweens
        let createFlash = (key: Phaser.GameObjects.Text) => {
            let flash = this.tweens.add({
                targets: key,
                duration: 400,
                alpha: 0,
                ease: 'Cubic.easeOut',
                repeat: -1,
                yoyo: true,
                paused: true
            })
            return flash
        }

        // create a map of flash tweens
        this.flashMap = new Map
        this.bindsArr.forEach( (keyText: Phaser.GameObjects.Text) => {
            this.flashMap.set(keyText, createFlash(keyText))
        })

        // make text keys interactive
        this.bindsArr.forEach( (key) => {
            key.setInteractive()

            key.on('pointerover', () => {
                this.scale.updateBounds()
                key.setScale(1.3)
            })

            key.on('pointerout', () => {
                this.scale.updateBounds()
                key.setScale(1)
            })  

            key.on('pointerdown', () => {
                this.scale.updateBounds()
                // remove listener if previously selected key was not updated by user
                this.bindsArr.forEach( () => {
                    this.input.keyboard.removeListener('keydown')
                })

                // go through textKeys and pause those that are not selected
                this.flashMap.forEach( (flash, text) => {
                    if (text === key) {
                        flash.resume()
                    } else {
                        // check if flash is playing first
                        if (flash.isPlaying()) {
                            flash.restart()
                            flash.pause()
                        }
                    }
                })

                // define pickBind function - user picks which key to bind movement to
                let pickBind = () => {
                    this.input.keyboard.once('keydown', (event: KeyboardEvent) => {
                        this.duplicateText.setVisible(false) 
                        this.invalidText.setVisible(false)
                        this.missingText.setVisible(false)
                        
                        // add capture so keys will not affect browser
                        this.input.keyboard.addCapture(event.keyCode) 

                        // use KeyboardEvent.key for Phaser.Input.Keyboard.Key
                        let keyMap = {
                            '`': 'BACKTICK',
                            '1': 'ONE',
                            '2': 'TWO',
                            '3': 'THREE',
                            '4': 'FOUR',
                            '5': 'FIVE',
                            '6': 'SIX',
                            '7': 'SEVEN',
                            '8': 'EIGHT',
                            '9': 'NINE',
                            '0': 'ZERO',
                            '[': 'OPEN_BRACKET',
                            ']': 'CLOSED_BRACKET',
                            '\\': 'BACK_SLASH',
                            ';': 'SEMICOLON',
                            '\'': 'QUOTES',
                            ',': 'COMMA',
                            '.': 'PERIOD',
                            '/': 'FORWARD_SLASH',
                            'Control': 'CTRL',
                            ' ': 'SPACE',
                            'ArrowUp': 'UP',
                            'ArrowDown': 'DOWN',
                            'ArrowLeft': 'LEFT',
                            'ArrowRight': 'RIGHT'
                        }

                        // array of valid keys
                        let validKeys = ['BACKTICK', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN',
                            'EIGHT', 'NINE', 'ZERO', 'BACKSPACE', 'TAB', 'SHIFT', 'CTRL', 'ALT',
                            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                            'OPEN_BRACKET', 'CLOSED_BRACKET', 'BACK_SLASH', 'SEMICOLON', 'QUOTES', 'ENTER',
                            'COMMA', 'PERIOD', 'FORWARD_SLASH', 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']

                        // need to use a dictionary for inconsitent keys
                        this.pressedKey = event.key
                        console.log(this.pressedKey)
                        if (keyMap.hasOwnProperty(this.pressedKey)) {
                            this.pressedKey = keyMap[this.pressedKey]
                        }
                        this.pressedKey = this.pressedKey.toUpperCase()

                        // check that selected key is valid
                        if (!validKeys.includes(this.pressedKey)) {
                            this.pressedKey = '_'
                            key.setText(this.pressedKey)                            
                            this.duplicateText.setVisible(false)
                            this.missingText.setVisible(false)
                            this.invalidText.setVisible(true)
                            // recusively traverse pickBind until valid key is selected
                            pickBind()
                        } else if (alreadyExists(this.pressedKey, this.bindsArr)) {
                            // check that key is not already in use
                            this.pressedKey = '_'
                            key.setText(this.pressedKey)
                            this.invalidText.setVisible(false)
                            this.missingText.setVisible(false)
                            this.duplicateText.setVisible(true)
                            // recusively traverse pickBind until non duplicate is selected
                            pickBind()
                        } else {
                            // stop flashing
                            this.flashMap.get(key).restart()
                            this.flashMap.get(key).stop()
                            // set key in map and in text overlay
                            key.setText(this.pressedKey)    
                        }
                    })
                }

                // set empty key while we wait for user input (if any)
                this.pressedKey = '_' 
                key.setText(this.pressedKey)
                
                // call pickBind() function
                pickBind()
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
            // check that all keys are valid
            if (this.bindsArr.every(hasValidKey)) {
                // go back to start scene
                this.scene.stop('BindingsScene');
                this.scene.start('StartScene', {
                    gasKey: this.gasText.text,
                    brakeKey: this.brakeText.text,
                    leftKey: this.leftText.text,
                    rightKey: this.rightText.text
                });
            } else {
                this.duplicateText.setVisible(false)
                this.invalidText.setVisible(false)
                this.missingText.setVisible(true)
            }
        })

        // helper function: checks for duplicate keys
        function alreadyExists(newKey: string, oldBindsArr: Phaser.GameObjects.Text[]) {
            let res = false
            oldBindsArr.forEach( (oldTextObj: Phaser.GameObjects.Text) => {
                if (newKey === oldTextObj.text) {
                    res = true
                }
            })
            return res;
        }

        // helper function: checks if all keys have a bind
        function hasValidKey(key: Phaser.GameObjects.Text) {
            return (key.text != '_')
        }
    }
}
