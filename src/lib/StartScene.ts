import Phaser from "phaser"
import type ConfigData from "./ConfigData"
import Car from "./Car"

export default class GameScene extends Phaser.Scene {

    carSprite: Phaser.GameObjects.Sprite;
    mapConfigData: ConfigData;
    vehicles: Phaser.GameObjects.Sprite[]; 
    selectedVehicle: string;
    //vehicles: Phaser.GameObjects.Group;

    constructor(mapConfigData: ConfigData) {
        super("StartScene");
        this.mapConfigData = mapConfigData;
    }

    preload() {
        this.load.image('car1', 'assets/Cars/car_blue_3.png')
    }

    create() {
        // title screen text
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 3.5,
                'Select a vehicle to start!', {fontSize: '250px'}).setOrigin(0.5, 0.5)

        // title screen text
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
        this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2.3,
        'Key Bindings', {fontSize: '150px'}).setOrigin(0.5, 0.5)
        
        // add vehicle class sprites
        this.carSprite = this.add.sprite(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2,
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 1.5, 'car1')
        this.carSprite.setScale(4)
       
        // add to array of vehicle classes
        this.vehicles = [];
        this.vehicles.push(this.carSprite)

        // select vehicle class
        this.vehicles.forEach( (vehicle) => {
            vehicle.setInteractive()
            vehicle.on('pointerdown', () => {
                this.selectedVehicle = vehicle.texture.key;

                // switch (this.selectedVehicle) {
                //     case 'car1' : {
                //         this.player = new Car(this.mapArray, this.mapConfigData)
                //         break;
                //     }


                // }

                console.log('player selected: ' + this.selectedVehicle);
                this.scene.stop('StartScene');
                this.scene.start('GameScene');
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
