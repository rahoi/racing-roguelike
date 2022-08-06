import ConfigData from "./ConfigData"
import StartScene from "./StartScene"
import BindingsScene from "./BindingsScene"
import GameScene from "./GameScene"
import EndScene from "./EndScene"
import Phaser from "phaser"

const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#193e04';  //'#bc8044'; 
const tilesetImageSheet = '/assets/road_spritesheet.png';
const tileKey = 'tiles';

let mapConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

let startScene = new StartScene(mapConfigData);
let bindingsScene = new BindingsScene(mapConfigData);
let gameScene = new GameScene(mapConfigData);
let endScene = new EndScene(mapConfigData);

const config: Phaser.Types.Core.GameConfig = 
{
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        parent: "game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: tileMapWidth * tileDimension,
        height: tileMapHeight * tileDimension
    },
    backgroundColor: backgroundColor, 
    // parent: 'gameContainer',
    // transparent: true,
    scene: [startScene, bindingsScene, gameScene, endScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    }
}

const game: Phaser.Game = new Phaser.Game(config);

export default game;
