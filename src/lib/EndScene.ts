import Phaser from "phaser"
import type ConfigData from "./ConfigData"

export default class EndScene extends Phaser.Scene {
    mapConfigData: ConfigData;
    active:boolean = false;
    score:number;
    numLevels:number;

    constructor(mapConfigData: ConfigData) {
        super("EndScene");
        this.mapConfigData = mapConfigData;
    }

    init(data:any) {
        console.log("end scene");
        this.numLevels = data.numLevels;
    }

    create() {
        // when viewing the entire map
        const x = this.mapConfigData.mapWidth * this.mapConfigData.tileDimension / 2;
        const y = this.mapConfigData.mapHeight * this.mapConfigData.tileDimension / 2 - 300;

        // if console shows only a portion of the map
        // const x = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        // const y = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.text(x, y, "Game Over", {fontSize: "300px", color: "#FFFFFF"}).setOrigin(0.5)

        this.add.text(x, y + 300, "Levels Completed: " + this.numLevels, {fontSize: "200px", color: "#FFFFFF"}).setOrigin(0.5)

        this.add.text(x, y + 600, "Click to race again", {fontSize: "120px", color: "#FFFFFF"}).setOrigin(0.5)

        // if we want to press any key to restart game
        // this.input.keyboard.on("keyup", () => {
        //     location.reload()
        // })

        // reloads the game when pointer clicks then is let up
        this.input.on("pointerup", () =>  {
            location.reload()
        });

    }

}
