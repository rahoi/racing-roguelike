import Phaser from "phaser"
import type ConfigData from "./ConfigData"

/**
 * EndScene creates the Phaser end scene for when the game is over. It displays the number
 * of levels completed and allows the player to click to race again where EndScene will
 * start up StartScene again.
 */
export default class EndScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    active:boolean = false;
    score:number;
    numCompletedLevels:number;
    endSound: Phaser.Sound.BaseSound;

    /**
     * Initiliazes config data
     * @param mapConfigData ConfigData object containing Phaser config data
     */
    constructor(mapConfigData: ConfigData) {
        super("EndScene");
        this.mapConfigData = mapConfigData;
    }

    /**
     * Initiliazes the numebr of levels completed
     * @param data number of levels completed from GameScene
     */
    init(data:any) {
        console.log("end scene");
        this.numCompletedLevels = data.numLevels;
    }

    /**
     * Loads audio assets
     */
    preload() {
        this.load.audio('endSound', './assets/game-over-sound.wav');
    }

    /**
     * Creates ending scene text
     */
    create() {
        //sound
        this.displaySound();

        // when viewing the entire map
        const x = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;
        const y = this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2 - 300;

        // if console shows only a portion of the map
        // const x = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        // const y = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.text(x, y, "Game Over", {fontSize: "300px", color: "#FFFFFF"}).setOrigin(0.5)

        this.add.text(x, y + 300, "Levels Completed: " + this.numCompletedLevels, {fontSize: "200px", color: "#FFFFFF"}).setOrigin(0.5)

        this.add.text(x, y + 600, "Click to race again", {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5)

        // if we want to press any key to restart game
        // this.input.keyboard.on("keyup", () => {
        //     location.reload()
        // })

        // reloads the game when pointer clicks then is let up
        this.input.on("pointerup", () =>  {
            this.endSound.destroy();
            location.reload()
        });

    }

    /**
     * Displays sound
     */
    private displaySound() {
        this.endSound = this.sound.add('endSound');

        this.endSound.play({
            loop: false
        });
    }
}
