import type ConfigData from "./ConfigData"
import type TileMapConstruct from "./TileMapConstruct"
import type Bike from "./Bike"
import type Car from "./Car"
import game from "./Game";

export default class FowTexture {
    scene: Phaser.Scene;
    map:Phaser.Tilemaps.Tilemap;
    rt: Phaser.GameObjects.RenderTexture;
    player: Bike | Car;
    playerSurrounding: Phaser.GameObjects.Graphics;
    vision: Phaser.GameObjects.Graphics;
    roadLayer: Phaser.Tilemaps.TilemapLayer;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
    
    constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.tileKey = mapConfigData.tileKey;
    }

    mapTexture(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){ //: Phaser.GameObjects.RenderTexture{
        this.scene = scene;
        this.map = map;
       
        const textureConfig = { 
            width: this.mapHeight * this.tileDimension,  //The width of the RenderTexture
            height: this.mapHeight * this.tileDimension  //The height of the RenderTexture
        }
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0)
  
        this.rt = this.scene.make.renderTexture(textureConfig, true);
        this.rt.fill(0xffffff)
        this.rt.setAlpha(0.8)
        this.rt.draw(this.roadLayer)
        this.rt.setTint(0xb0000)        
        return this.rt;
    }

    playerMask(scene: Phaser.Scene, rt: Phaser.GameObjects.RenderTexture, player: Bike | Car){
        this.scene = scene
        this.rt = rt
        this.player = player
        
        this.playerSurrounding =  this.scene.make.graphics(this.scene);
        this.playerSurrounding.fillStyle(0xffffff);  //.setAlpha(0.4); //0xFFFFFF
        this.playerSurrounding.beginPath();
        this.playerSurrounding.arc(this.player.posX, this.player.posY, 100, 0, Math.PI *2);
        this.playerSurrounding.fillPath();

        this.rt.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.playerSurrounding)
        this.rt.mask.invertAlpha = true;
   
        return this.playerSurrounding;
    }

    updatePlayerMask(playerSurrounding: Phaser.GameObjects.Graphics, player: Bike | Car){
        this.playerSurrounding = playerSurrounding
        this.player = player
        if (this.playerSurrounding){
            this.playerSurrounding.x = player.posX
            this.playerSurrounding.y = player.posY
        }
    }

       // createCamera(scene: Phaser.Scene, vision: Phaser.GameObjects.Graphics) {
    //     this.scene = scene;
    //     this.vision = vision;
    //     this.scene.cameras.main.setBounds(0, 0, this.mapWidth * this.tileDimension, this.mapHeight * this.tileDimension);
    //     this.scene.cameras.main.startFollow(vision, true, 0.07, 0.07);
    //     // this.scene.cameras.main.setZoom(1.2);
    // }

}