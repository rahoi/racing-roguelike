//import Phaser from "phaser";


import type ConfigData from "./ConfigData";

const startTime = new Date().getTime(); 
const initialTime = 15;

export default class timer{
    scene: Phaser.Scene;
    startTimeObject: Date;
    //startTime: number;
    currentTimeObject: Date;
    //currentTime: number;
    totalTime: number;
    timeElapsed: number;
    //timeLabel: String;
    mapConfigData: ConfigData;
    centerX: number;
    gameTimer: any;
    timerEvent: Phaser.Time.TimerEvent;
    timeLabel: Phaser.GameObjects.Text;
    timeLeft: number;
    energyMask: Phaser.GameObjects.Sprite;
    scenePlugin: Phaser.Scenes.ScenePlugin;

   constructor(scene: Phaser.Scene, mapConfigData: ConfigData) {
        this.scene = scene;
        this.startTimeObject = new Date();
        //const startTime = this.startTimeObject.getTime();
        //this.currentTime = new Date();
        //this.totalTime = totalTime;

        this.timeElapsed = 0;
        this.mapConfigData = mapConfigData;  
        
        this.formatTimer(this.totalTime);
        
        // this.gameTimer = game.time.events.loop(100, function(){
        //     this.updateTimer();
        // });

        this.timerEvent = this.scene.time.addEvent({ delay: 1000, callback: this.updateTimer, loop: true });
    }

    private formatTimer(totalTime: number) {
        this.totalTime = totalTime;
        //this.scene = scene;
        this.centerX = this.scene.scale.width / 2; //this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;
        
        this.timeLabel = this.scene.add.text(this.centerX, 100, 'Timer: ' + this.updateTimer(this.totalTime), {fontSize: "250px", color: "#FFFFFF"}).setOrigin(0.5, 0);

        // = this.scene.add.text(this.centerX, 100, 'Timer', {fontSize: '250px'}).setFill('#ffffff').setShadow(2, 2, "#333333", 2).setOrigin(0.5, 0);


        //this.timeLabel.text = result;
        
        //this.timeLabel.setText('time: ' + this.updateTimer());

        //label.setText('timeScale: ');
        // this.timeLabel = this.scene.add.text(this.scene.world.centerX, 100, "00:00", {font: "100px Arial", fill: "#fff"});
        
        // this.timeLabel.anchor.setTo(0.5, 0);
        // this.timeLabel.align = 'center';
    }


    private updateTimer(totalTime: number) {
        this.totalTime = totalTime;
        
        this.currentTimeObject = new Date();
        var currentTime = this.currentTimeObject.getTime();
        var timeDifference = startTime - currentTime;
        console.log("starting time " + startTime);
        console.log("current time " + currentTime);

        //Time elapsed in seconds
        this.timeElapsed = Math.abs(timeDifference / 1000);
        console.log("timeElapsed: " + this.timeElapsed);
        
        //Time remaining in seconds
        var timeRemaining = this.totalTime - this.timeElapsed;
        console.log("timeRemaining: " + timeRemaining);

        //Convert seconds into minutes and seconds
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = Math.floor(timeRemaining) - (60 * minutes);

        console.log("minutes: " + minutes);
        console.log("seconds: " + seconds);
        
        //Format minutes and seconds by adding a 0 to the start if less than 2 digits
        var result = (minutes < 10) ? "0" + minutes : minutes;
        result += (seconds < 10) ? ":0" + seconds : ":" + seconds;
        
        console.log("result " + result);

        return result;
        //this.timeLabel.text = result;
    }

    private preloadImages() {
        this.scene.load.image("energycontainer", "./assets/timeContainer.png");
        this.scene.load.image("energybar", "./assets/timeBar.png");
    }

    displayTimer(scene: Phaser.Scenes.ScenePlugin) {
        this.scenePlugin = scene;
        //this.scene.
        //this.preloadImages();

        this.timeLeft = initialTime;
        //this.scene = scene;

        // the energy container. A simple sprite
        let energyContainer = this.scene.add.sprite(this.centerX, 3500, "energycontainer");
 
        // the energy bar. Another simple sprite
        let energyBar = this.scene.add.sprite(energyContainer.x + 46, energyContainer.y, "energybar");
 
        // a copy of the energy bar to be used as a mask. Another simple sprite but...
        this.energyMask = this.scene.add.sprite(energyBar.x, energyBar.y, "energybar");
 
        // ...it's not visible...
        this.energyMask.visible = false;
 
        // and we assign it as energyBar's mask.
        energyBar.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.energyMask);
 
        // a boring timer.
        this.gameTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: function(){
                this.timeLeft --;
 
                // dividing enery bar width by the number of seconds gives us the amount
                // of pixels we need to move the energy bar each second
                let stepWidth = this.energyMask.displayWidth / initialTime;
 
                // moving the mask
                this.energyMask.x -= stepWidth;
                if(this.timeLeft === 0){
                    this.scenePlugin.stop('GameScene');
                    //this.gameSound.destroy();
                    this.scenePlugin.start('EndScene');

                }
            },
            callbackScope: this,
            loop: true
        });
    }

    // // counts down timer using Phaser logic
    // onEventTimer() {
    //     this.countdown -= 1; // one second
    //     if (this.countdown < 10) {
    //         this.timerText.setText('00:' + '0' + this.countdown);  
    //     } else {
    //         this.timerText.setText('00:' + this.countdown);
    //     }
        
    // }

}

