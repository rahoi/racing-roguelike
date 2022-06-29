import mapData from "./MapData.js"
import gameScene from "./GameScene.js"

const config = 
{
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        parent: "game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: mapData.mapWidth * mapData.tileDimension,
        height: mapData.mapHeight * mapData.tileDimension
    },
    backgroundColor: mapData.backgroundColor,
    scene: [gameScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    }
}

const game = new Phaser.Game(config)