import type ConfigData from "./ConfigData"
import type TileMapConstruct from "./TileMapConstruct"
import type Car from "./Car"
import game from "./Game";

//import * as Phaser from "phaser";
//import * as Phaser from "phaser";
//import Phaser from 'phaser';
//import Phaser from 'https://www.unpkg.com/browse/phaser@3.55.2/'
//const Phaser = await import('https://www.unpkg.com/browse/phaser@3.55.2/');

export default class FowTexture {
    scene: Phaser.Scene;
    map:Phaser.Tilemaps.Tilemap;
    rt: Phaser.GameObjects.RenderTexture;
    car: Car;
    carSurrounding: Phaser.GameObjects.Graphics;
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

    // createCamera(scene: Phaser.Scene, vision: Phaser.GameObjects.Graphics) {
    //     this.scene = scene;
    //     this.vision = vision;
    //     this.scene.cameras.main.setBounds(0, 0, this.mapWidth * this.tileDimension, this.mapHeight * this.tileDimension);
    //     this.scene.cameras.main.startFollow(vision, true, 0.07, 0.07);
    //     // this.scene.cameras.main.setZoom(1.2);
    // }


    ///FIXED
    mapTexture(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){ //: Phaser.GameObjects.RenderTexture{
        this.scene = scene;
        this.map = map;
       
        const textureConfig = { 
            width: this.mapHeight * this.tileDimension,  //The width of the RenderTexture
            height: this.mapHeight * this.tileDimension  //The height of the RenderTexture
        }
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0)


       // this.scene.make.graphics(this.scene).fillCircle(300,500,5).beginPath();
       // this.scene..fillStyle(0x00FF00); //0xFFFFFF


        
       // this.rt = new Phaser.GameObjects.RenderTexture(this.scene, 0, 0, 600, 800);
        
        this.rt = this.scene.make.renderTexture(textureConfig, true);
        //this.rt.beginDraw();
        //this.rt = this.scene.make.renderTexture(textureConfig, true)  //true=add this Game Object to the Scene
        this.rt.fill(0xffffff)
        this.rt.setAlpha(0.8)
        //this.rt = this.scene.add.renderTexture(0, 0, 800, 600);

        //draw the roadLayer into the render texture
        this.rt.draw(this.roadLayer)
        this.rt.setTint(0xb0000)
        
        return this.rt;
    }









    // mapTexture(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){
    //     this.scene = scene;
    //     this.map = map;
       
    //     const textureConfig = { 
    //         width: this.mapHeight * this.tileDimension,  //The width of the RenderTexture
    //         height: this.mapHeight * this.tileDimension  //The height of the RenderTexture
    //     }
    //     const tileset = this.map.addTilesetImage(this.tileKey)
    //     this.roadLayer = this.map.createLayer(0, tileset, 0, 0)

    //     this.rt = this.scene.make.renderTexture(textureConfig, true)  //true=add this Game Object to the Scene
    //     this.rt.fill(0x000000)
    //     this.rt.setAlpha(0.8)

    //     //draw the roadLayer into the render texture
    //     this.rt.draw(this.roadLayer)
    //     return this.rt;
    // }


    carMask(scene: Phaser.Scene, rt: Phaser.GameObjects.RenderTexture, car: Car): Phaser.GameObjects.Graphics{
        this.scene = scene
        this.rt = rt
        this.car = car
        
        this.carSurrounding = this.scene.make.graphics(this.scene);
        this.carSurrounding.fillStyle(0xFFFFFF).setAlpha(0.4); //0xFFFFFF
        this.carSurrounding.beginPath();
        this.carSurrounding.arc(this.car.posX, this.car.posY, 100, 0, Math.PI *2);
        this.carSurrounding.fillPath();

        this.rt.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.carSurrounding)
        this.rt.mask.invertAlpha = true;

        return this.carSurrounding;
    }
/*
    updateCarMask(car: Car){
        // this.carSurrounding = carSurrounding
        // this.car = car
        // if (this.carSurrounding){
        //     this.carSurrounding.x = this.car.posX;
        //     this.carSurrounding.y = this.car.posY;
        // }

        this.carSurrounding.x = this.car.posX;
        this.carSurrounding.y = this.car.posY;
    }
*/
}