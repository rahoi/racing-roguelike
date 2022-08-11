import ConfigData from "./ConfigData"
import StartScene from "./StartScene"
import BindingsScene from "./BindingsScene"
import GameScene from "./GameScene"
import Phaser from "phaser"
import EndScene from "./EndScene";

/**
 * Game stores configuration information for and creates the Phaser game,
 * and starts up the different Phaser scenes
 */

// configuration data for the game (can be adjusted/changed)
const tileDimension = 128;
const tileMapHeight = 40;
const tileMapWidth = 40;
const backgroundColor = '#193e04';  //'#bc8044'; 
const tilesetImageSheet = 'assets/road_spritesheet.png';
const tileKey = 'tiles';

// creates a ConfigData object to be sent to each Phaser scene
let mapConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

// creates new Scenes
let startScene = new StartScene(mapConfigData);
let bindingsScene = new BindingsScene(mapConfigData);
let gameScene = new GameScene(mapConfigData);
let endScene = new EndScene(mapConfigData);

// creates the GameConfig for the Phaser game
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
    scene: [startScene, bindingsScene, gameScene, endScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    }
}

// creates a new Phaser Game
const game: Phaser.Game = new Phaser.Game(config);

export default game;
