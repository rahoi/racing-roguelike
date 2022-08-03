//import Phaser from "phaser";

import type ConfigData from "./ConfigData";

const startTime = new Date().getTime(); 

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

   constructor(scene: Phaser.Scene, mapConfigData: ConfigData, totalTime: number) {
        this.scene = scene;
        this.startTimeObject = new Date();
        //const startTime = this.startTimeObject.getTime();
        //this.currentTime = new Date();
        this.totalTime = totalTime;

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
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;

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



}

