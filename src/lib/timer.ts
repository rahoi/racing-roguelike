import type ConfigData from "./ConfigData";

const initialTime = 15;
const startTime = new Date().getTime()//;

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
    countdown: number;
    timeMask: Phaser.GameObjects.Sprite;
    scenePlugin: Phaser.Scenes.ScenePlugin;
    clockObject: Phaser.GameObjects.Image;
    clockImage: Phaser.Loader.LoaderPlugin;
    timeContainerImage: Phaser.Loader.LoaderPlugin;
    timeBarImage: Phaser.Loader.LoaderPlugin;
    timeDifference: number;
    startTime: number;
    currentTime: number;
    resultStr: string;

    
   constructor(scene: Phaser.Scene, mapConfigData: ConfigData) {
        this.scene = scene;
        //this.startTimeObject = new Date();
       
        //const startTime = this.startTimeObject.getTime();
        //this.currentTime = new Date();
        //this.totalTime = totalTime;

        //this.startTime = startTime;
        this.timeElapsed = 0;
        this.mapConfigData = mapConfigData;  
        
        this.formatTimer(initialTime);
        
        this.timerEvent = this.scene.time.addEvent({ 
            delay: 1000, 
            callback: this.onEventTimer,  //callback: this.updateTimer, 
            loop: false 
        });
    }

    private formatTimer(countdown: number ) {
        //this.startTime = startTime
        this.countdown = countdown;
        this.centerX = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;
       
        this.timeLabel = this.scene.add.text(
            this.centerX, 
            3700, 
            '00:' + this.countdown,  //this.updateTimer(initialTime), 
            {
                fontStyle: "Bold", 
                fontSize: "120px", 
                color: "#ffffff"
            })
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.clockObject = this.scene.add.image(this.centerX - 250, 3700, 'clock').setDisplaySize(100, 100).setScrollFactor(0);
       
    }


    private updateTimer(totalTime: number) {
        this.totalTime = totalTime;
        
        this.currentTimeObject = new Date();
        this.currentTime = this.currentTimeObject.getTime();
        this.timeDifference = startTime - this.currentTime;

        //Time elapsed in seconds
        this.timeElapsed = Math.abs(this.timeDifference / 1000);
        
        //Time remaining in seconds
        var timeRemaining = initialTime - this.timeElapsed;

        //Convert seconds into minutes and seconds
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = Math.floor(timeRemaining) - (60 * minutes);

        console.log("minutes: " + minutes);
        console.log("seconds: " + seconds);
        
        //Format minutes and seconds by adding a 0 to the start if less than 2 digits
        var result = (minutes < 10) ? "0" + minutes : minutes;
        result += (seconds < 10) ? ":0" + seconds : ":" + seconds;
        this.resultStr = String(result);
        console.log("result " + this.resultStr);

        //return result;
        //this.timeLabel.text = this.resultStr;
    }

    // private preloadImages() {
    //     this.clockImage = this.scene.load.image('clock', './assets/icons8-timer-64.png');
    //     this.timeContainerImage = this.scene.load.image('timecontainer', "./assets/timeContainer.png");
    //     this.timeBarImage = this.scene.load.image('timebar', "./assets/timeBar.png");
    // }

    displayTimer(scene: Phaser.Scenes.ScenePlugin, totalTime: number) {
        this.scenePlugin = scene;
        this.countdown = totalTime;
    
        //this.clockObject = this.scene.add.image(this.centerX - 250, 3700, 'clock').setDisplaySize(100, 100).setScrollFactor(0);
        let timeContainer = this.scene.add.sprite(this.centerX, 3500, "timecontainer");
        let timeBar = this.scene.add.sprite(timeContainer.x + 46, timeContainer.y, "timebar");
 
        // a copy of the time bar to be used as a mask
        this.timeMask = this.scene.add.sprite(timeBar.x, timeBar.y, "timebar");
        this.timeMask.visible = false;
        timeBar.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.timeMask);

        this.gameTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: function(){
                this.countdown--;
 
                // dividing time bar width by the number of seconds gives us the amount
                // of pixels we need to move the time bar each second
                let stepWidth = this.timeMask.displayWidth / initialTime;
                
               
                // moving the mask
                this.timeMask.x -= stepWidth;
                if(this.countdown === 0){
                    this.scenePlugin.stop('GameScene');
                    //this.gameSound.destroy();
                    this.scenePlugin.start('EndScene');

                }
            },
            callbackScope: this,
            loop: true
        });
    }

        // counts down timer using Phaser logic
    onEventTimer(timeLabel: Phaser.GameObjects.Text) {
        this.timeLabel = timeLabel;
        //this.countdown -= 1; // one second
        if (this.countdown < 10) {
            this.timeLabel.setText('00:' + '0' + this.countdown);  
        } else {
            this.timeLabel.setText('00:' + this.countdown);
        }
        
    }


}

