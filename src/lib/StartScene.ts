import Phaser from "phaser"
import type ConfigData from "./ConfigData"

/**
 * StartScene creates the initial Phaser Scene, loads in all the sprite images, sets up character
 * selection, and creates an overview of the characters' class attributes. If user selects on a
 * character, StartScene will start up GameScene. If user selects on key bindings text, StartScene
 * will start up BindingsScene.
 */
export default class StartScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    startSound: Phaser.Sound.BaseSound;
    bindingsText: Phaser.GameObjects.Text;
    carSprite: Phaser.GameObjects.Sprite;
    bikeSprite: Phaser.GameObjects.Sprite;
    truckSprite: Phaser.GameObjects.Sprite;
    vehicles: Phaser.GameObjects.Sprite[];
    image: string; 
    selectedVehicle: string;
    timer: number;
    currentLevel:number;
    gasKey: string;
    brakeKey: string;
    leftKey: string;
    rightKey: string;
    //vehicles: Phaser.GameObjects.Group;

    /**
     * Initiliazes the time and currentLevel for GameScene
     * @param mapConfigData ConfigData object containing Phaser config data
     */
    constructor(mapConfigData: ConfigData) {
        super("StartScene");
        this.mapConfigData = mapConfigData;
        this.timer = 120; // number of seconds for first level
        this.currentLevel = 1;
    }

    /**
     * Initiliazes the keybindings
     * @param data keyBinding data from BindingsScene
     */
    init(data: any) {
        // set default keybinds and update if needed
        if (typeof data.gasKey === 'undefined') { this.gasKey = 'SPACE' } 
        else { this.gasKey = data.gasKey }

        if (typeof data.brakeKey === 'undefined') { this.brakeKey = 'S' }
        else { this.brakeKey = data.brakeKey }

        if (typeof data.leftKey === 'undefined') { this.leftKey = 'A' }
        else { this.leftKey = data.leftKey }

        if (typeof data.rightKey === 'undefined') { this.rightKey= 'D' }
        else { this.rightKey = data.rightKey }
    }

    /**
     * Loads character assets
     */
    preload() {
        this.load.image('car', 'assets/Cars/car_blue_3.png')
        this.load.image('bike', 'assets/Motorcycles/motorcycle_yellow.png')
        this.load.image('truck', 'assets/Cars/car_red_4.png')
        this.load.audio('startSound', './assets/video-game-land-sound.wav');
    }

    /**
     * Creates interactive text, sprite images, and character bars
     */
    create() {
        //sound 
        this.displaySound();

        // title screen text
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 4,
                'Select a vehicle to start!', {fontSize: '250px'}).setOrigin(0.5, 0.5)

        // key bindings text
        this.bindingsText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2.7,
                                'Key Binding Options', {fontSize: '155px'}).setOrigin(0.5, 0.5)
        
        // make key bindings text interactive
        this.bindingsText.setInteractive()
        this.bindingsText.on('pointerover', () => {
            this.scale.updateBounds()
            this.bindingsText.setScale(1.15)
        })
        this.bindingsText.on('pointerout', () => {
            this.scale.updateBounds()
            this.bindingsText.setScale(1)
        })
        this.bindingsText.on('pointerdown', () => {
            this.scale.updateBounds()
            this.scene.stop('StartScene');
            this.startSound.destroy();
            this.scene.start('BindingsScene', {
                gasKey: this.gasKey,
                brakeKey: this.brakeKey,
                leftKey: this.leftKey,
                rightKey: this.rightKey
            });
        })
        
        // add vehicle class sprites
        this.carSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.8, 'car')
        this.carSprite.setScale(4)
        this.bikeSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.4,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.8, 'bike')
        this.bikeSprite.setScale(4)
        this.truckSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 3.5,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.8, 'truck')
        this.truckSprite.setScale(4)
       
        // add to array of vehicle classes
        this.vehicles = [];
        this.vehicles.push(this.carSprite)
        this.vehicles.push(this.bikeSprite)
        this.vehicles.push(this.truckSprite)

        // select vehicle class
        this.vehicles.forEach( (vehicle) => {
            vehicle.setInteractive()
            vehicle.on('pointerover', () => {
                this.scale.updateBounds()
                vehicle.setScale(5)
            })
            vehicle.on('pointerout', () => {
                this.scale.updateBounds()
                vehicle.setScale(4)
            })
            vehicle.on('pointerdown', () => {
                this.scale.updateBounds()
                this.selectedVehicle = vehicle.texture.key;
                switch (this.selectedVehicle) {
                    case 'car': {
                        this.image = 'assets/Cars/car_blue_3.png';
                        break;
                    }
                    case 'bike': {
                        this.image = 'assets/Motorcycles/motorcycle_yellow.png';
                        break;
                    }
                    case 'truck': {
                        this.image = 'assets/Cars/car_red_4.png';
                        break;
                    }
                }
                console.log('player selected: ' + this.selectedVehicle);
                this.scene.stop('StartScene');
                this.startSound.destroy();
                this.scene.start('GameScene', {
                    id: this.selectedVehicle,
                    image: this.image,
                    timer: this.timer,
                    currentLevel: this.currentLevel,
                    gasKey: this.gasKey,
                    brakeKey: this.brakeKey,
                    leftKey: this.leftKey,
                    rightKey: this.rightKey
                });
            })
        })

        // class attributes text
        this.add.text(200, 3525, 'acceleration:', {fontSize: '90px'})
        this.add.text(200, 3775, 'steering:', {fontSize: '90px'})
        this.add.text(200, 4025, 'traction:', {fontSize: '90px'})
        this.add.text(200, 4275, 'off road:', {fontSize: '90px'})

        // truck bars
        this.makeBar(1180, 3550, 0x2ecc71, 300) // acceleration
        this.makeBar(1180, 3800, 0x2ecc71, 200) // steering
        this.makeBar(1180, 4075, 0x2ecc71, 280) // traction
        this.makeBar(1180, 4325, 0x2ecc71, 240) // off road

        // car bars
        this.makeBar(2280, 3550, 0x2ecc71, 200) // acceleration
        this.makeBar(2280, 3800, 0x2ecc71, 220) // steering
        this.makeBar(2280, 4075, 0x2ecc71, 250) // traction
        this.makeBar(2280, 4325, 0x2ecc71, 200) // off road

        // bike bars
        this.makeBar(3380, 3550, 0x2ecc71, 220) // acceleration
        this.makeBar(3380, 3800, 0x2ecc71, 270) // steering
        this.makeBar(3380, 4075, 0x2ecc71, 220) // traction
        this.makeBar(3380, 4325, 0x2ecc71, 280) // off road

        // this.vehicles = this.add.group();
        // this.vehicles.add(this.carSprite)
        // Phaser.Actions.Call(this.vehicles.getChildren(), function(item) {
        //     item.setInteractive();
        //     item.on('pointerdown', () => {
        //         console.log('you clicked on ' + item.texture.key);
        //         this.scene.stop('StartScene')
		//         this.scene.start('GameScene')
        //     })
        // }, this);
    }

    /**
     * Displays sound
     */
    private displaySound() {
        this.startSound = this.sound.add('startSound');
        this.startSound.play({
            loop: true
        });
    }
    
    /**
     * Creates a filled in rectangular bar
     * @param x x coordinate
     * @param y y coordinate
     * @param color hex color
     * @param percentage size of bar
     * @returns phaser graphics object
     */
    private makeBar(x: number, y: number, color: any, percentage: number) {
        // draw the bar
        let bar = this.add.graphics();
        // color the bar
        bar.fillStyle(color, 1);
        // fill the bar with a rectangle
        bar.fillRect(0, 0, 200, 50);
        // position the bar
        bar.x = x;
        bar.y = y;
        // scale the bar and return
        bar.scaleX = percentage / 100;
        return bar;
    }
}
