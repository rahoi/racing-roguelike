//import Phaser from "phaser";

import type ConfigData from "./ConfigData";




export default class timer{
    scene: Phaser.Scene;
    startTime: Date;
    totalTime: number;
    timeElapsed: number;
    timeLabel: String;
    mapConfigData: ConfigData;
    centerX: number;
    gameTimer: any;
    
    

   constructor(scene: Phaser.Scene, mapConfigData: ConfigData) {
        this.scene = scene;
        this.startTime = new Date();
        this.totalTime = 120;  //120 sec
        this.timeElapsed = 0;
        this.mapConfigData = mapConfigData;  
        
        this.formatTimer(this.scene);
        
        // this.gameTimer = game.time.events.loop(100, function(){
        //     this.updateTimer();
        // });


        // this.scene.game.loop = (add.(100, functn(){
        //     this.updateTimer();
        // })
    }

    formatTimer(scene: Phaser.Scene) {
        this.scene = scene;
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;

        var timeLabel = this.scene.add.text(this.centerX, 100, 'Timer', {fontSize: '250px'}).setFill('#ffffff').setShadow(2, 2, "#333333", 2).setOrigin(0.5, 0);


        //this.timeLabel.text = result;
        timeLabel.setText('time: ' + this.updateTimer());

        //label.setText('timeScale: ');
        // this.timeLabel = this.scene.add.text(this.scene.world.centerX, 100, "00:00", {font: "100px Arial", fill: "#fff"});
        
        // this.timeLabel.anchor.setTo(0.5, 0);
        // this.timeLabel.align = 'center';
    }


    updateTimer() {
        //this.scene = scene;
        var currentTime = new Date();
        var timeDifference = this.startTime.getTime() - currentTime.getTime();
        
        //Time elapsed in seconds
        this.timeElapsed = Math.abs(timeDifference / 1000);
        
        //Time remaining in seconds
        var timeRemaining = this.totalTime - this.timeElapsed;
        
        //Convert seconds into minutes and seconds
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = Math.floor(timeRemaining) - (60 * minutes);
        
        //Display minutes, add a 0 to the start if less than 2 digits
        var result = (minutes < 10) ? "0" + minutes : minutes;
        
        //Display seconds, add a 0 to the start if less than 2 digits
        result += (seconds < 10) ? ":0" + seconds : ":" + seconds;
        return result;
    }



}

