import ConfigData from "./ConfigData"
import StartScene from "./StartScene"
import GameScene from "./GameScene"
import Phaser from "phaser"

const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'

let mapConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

let startScene = new StartScene(mapConfigData);
let gameScene = new GameScene(mapConfigData);

const config: Phaser.Types.Core.GameConfig = 
{
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        parent: "game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
        ,
        width: tileMapWidth * tileDimension,
        height: tileMapHeight * tileDimension
    },
    backgroundColor: backgroundColor,
    // parent: 'gameContainer',
    // transparent: true,
    scene: [startScene, gameScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    }
}

const game: Phaser.Game = new Phaser.Game(config);

export default game;