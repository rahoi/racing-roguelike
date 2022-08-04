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
    numLevels:number;
    //vehicles: Phaser.GameObjects.Group;

    constructor(mapConfigData: ConfigData) {
        super("StartScene");
        this.mapConfigData = mapConfigData;
        this.timer = 15; // timer for first level
        this.numLevels = 1;
    }

    preload() {
        this.load.image('car', 'assets/Cars/car_blue_3.png')
        this.load.image('bike', 'assets/Motorcycles/motorcycle_yellow.png')
        this.load.audio('startSound', './assets/video-game-land-sound.wav');
    }

    create() {

        //sound 
        var startSceneSound = this.sound.add('startSound');

        startSceneSound.play({
            loop: true
        });



        // title screen text
        this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
                this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 3.5,
                'Select a vehicle to start!', {fontSize: '250px'}).setOrigin(0.5, 0.5)

        // key bindings text
        // this.add.text(this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2, 
        // this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2.3,
        // 'Key Bindings', {fontSize: '150px'}).setOrigin(0.5, 0.5)
        
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
            vehicle.on('pointerdown', () => {
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
                startSceneSound.destroy();
                this.scene.start('GameScene', {id: this.selectedVehicle, image: this.image, timer: this.timer, numLevels: this.numLevels});
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
