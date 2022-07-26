import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	player: Car | Bike;
	camera: Phaser.Cameras.Scene2D.CameraManager;
    carSurrounding: Phaser.GameObjects.Graphics;
	tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;

	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;    // height: this.mapHeight * this.tileDimension  //The height
        this.mapWidth = mapConfigData.mapWidth;      // this.mapHeight * this.tileDimension,  //The width
        this.tileKey = mapConfigData.tileKey;
	}

	mapLayer(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){
        this.scene = scene;
        this.map = map;
       
        const textureConfig = { 
            width: this.mapHeight * this.tileDimension,  
            height: this.mapHeight * this.tileDimension 
        }
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0)	
	}

    cameraFow(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.CameraManager) {
		this.scene = scene;
		this.map = map;
		this.camera = camera
        
		const bounds = new Phaser.Geom.Rectangle(
			this.map.worldToTileX(this.camera.main.worldView.x),
			this.map.worldToTileY(this.camera.main.worldView.y),
			this.map.worldToTileX(this.camera.main.worldView.width),
			this.map.worldToTileX(this.camera.main.worldView.height)
		)
	
		for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
					continue;
				}

				const tile = this.roadLayer.getTileAt(x, y);
				if (!tile) {
				 	continue;
				}
                tile.setAlpha(1);
                tile.tint = 0x333333;
			}
		}	
	}

    createFow () {
        //determine if a tile can be seen through (floor can't block the vision)
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapHeight, this.mapWidth, isTransparent);
    }
    
    calculateFow(scene: Phaser.Scene, player: Car | Bike) {
        this.scene = scene;
        this.player = player;
    
        const px = this.map.worldToTileX(this.player.posX)
        const py = this.map.worldToTileY(this.player.posY)
        const radius = 4;

    let isVisible = (x:number, y:number): boolean => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return false;  
        }
        return tile.tint === 0xffffff;
    }

    let setVisibility = (x:number, y:number) => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return;
        }
        tile.setAlpha(1);
        tile.tint = 0xffffff;
    }

        this.fow.compute(
        px,
        py,
        radius, 
        isVisible,
        setVisibility)
    }
}