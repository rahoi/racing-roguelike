import Phaser from "phaser"
import type ConfigData from "./ConfigData"

export default class StartScene extends Phaser.Scene {

    carSprite: Phaser.GameObjects.Sprite;
    bikeSprite: Phaser.GameObjects.Sprite;
    image: string;
    mapConfigData: ConfigData;
    vehicles: Phaser.GameObjects.Sprite[]; 
    selectedVehicle: string;
    timer: number;
    numLevels: number;
    bindingsText: Phaser.GameObjects.Text;
    gasKey: string;
    brakeKey: string;
    leftKey: string;
    rightKey: string;
    //vehicles: Phaser.GameObjects.Group;

    constructor(mapConfigData: ConfigData) {
        super("StartScene");
        this.mapConfigData = mapConfigData;
        this.timer = 60; // timer for first level
        this.numLevels = 1;
    }

    init(data: any) {
        // check if keys have been rebind
        if (typeof data.gasKey === 'undefined') {
            this.gasKey = 'SPACE'
        } else {
            this.gasKey = data.gasKey
        }
        
        if (typeof data.brakeKey === 'undefined') {
            this.brakeKey = 'S'
        } else {
            this.brakeKey = data.brakeKey
        }

        if (typeof data.leftKey === 'undefined') {
            this.leftKey = 'A'
        } else {
            this.leftKey = data.leftKey
        }

        if (typeof data.rightKey === 'undefined') {
            this.rightKey= 'D'
        } else {
            this.rightKey = data.rightKey
        }
    }

    preload() {
        this.load.image('car', 'assets/Cars/car_blue_3.png')
        this.load.image('bike', 'assets/Motorcycles/motorcycle_yellow.png')
    }

    create() {
        // title screen text
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 3,
                'Select a vehicle to start!', {fontSize: '250px'}).setOrigin(0.5, 0.5)

        // key bindings text
        this.bindingsText = this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2.1,
                                'Key Binding Options', {fontSize: '155px'}).setOrigin(0.5, 0.5)
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
            this.scene.start('BindingsScene');
        })
        
        // add vehicle class sprites
        this.carSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.5, 'car')
        this.carSprite.setScale(4)
        this.bikeSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 1.5,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.5, 'bike')
        this.bikeSprite.setScale(4)
       
        // add to array of vehicle classes
        this.vehicles = [];
        this.vehicles.push(this.carSprite)
        this.vehicles.push(this.bikeSprite)

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
                }
                console.log('player selected: ' + this.selectedVehicle);
                this.scene.stop('StartScene');
                this.scene.start('GameScene', {
                    id: this.selectedVehicle,
                    image: this.image,
                    timer: this.timer,
                    numLevels: this.numLevels,
                    gasKey: this.gasKey,
                    brakeKey: this.brakeKey,
                    leftKey: this.leftKey,
                    rightKey: this.rightKey
                });
            })
        })

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
}
