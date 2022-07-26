import { Mrpas } from "mrpas";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	car: Car;
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
                tile.setAlpha(0.1);  //dark = hide all the tiles
			}
		}	
	}

    createFow () {
        //determine if a tile can be seen through
        //floor can't block the vision
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapHeight, this.mapWidth, isTransparent);
    }
    
    calculateFow(scene: Phaser.Scene, car: Car) {
        this.scene = scene;
        this.car = car;
    
        const px = this.map.worldToTileX(this.car.posX)
        const py = this.map.worldToTileY(this.car.posY)
        const radius = 2.5;

    let isVisible = (x:number, y:number): boolean => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return false;  
        } 
    }

    let setVisibility = (x:number, y:number) => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return;
        }
        tile.setAlpha(1);
    }

        this.fow.compute(
        px,
        py,
        radius, 
        isVisible,
        setVisibility)
    }
}



//////////////////// OPTION 2 ////////////
/////////////////////////////
/*

import { Mrpas } from "mrpas";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	car: Car;
	camera: Phaser.Cameras.Scene2D.CameraManager;
	tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
  //  light: Phaser.GameObjects.Light;
    
	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;    // height: this.mapHeight * this.tileDimension  //The height
        this.mapWidth = mapConfigData.mapWidth;      // this.mapHeight * this.tileDimension,  //The width
        this.tileKey = mapConfigData.tileKey;

        const n = 100; // size of the array
        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false)); 

	}
	mapLayer(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
        this.scene = scene;
        this.map = map;
       
        const textureConfig = { 
            width: this.mapHeight * this.tileDimension,  
            height: this.mapHeight * this.tileDimension 
        }
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0);
	}

    cameraFow(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.CameraManager) {
		this.scene = scene;
		this.map = map;
		this.camera = camera;

    
		const bounds = new Phaser.Geom.Rectangle(
			this.map.worldToTileX(this.camera.main.worldView.x),
			this.map.worldToTileY(this.camera.main.worldView.y),
			this.map.worldToTileX(this.camera.main.worldView.width),
			this.map.worldToTileX(this.camera.main.worldView.height))
	
		for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
					continue;
				}

				const tile = this.roadLayer.getTileAt(x, y);
				if (!tile) {
				 	continue;
				}
                tile.setAlpha(0.1);  //dark = hide all the tiles
               // tile.tint = 0x404040;
			}
		}	
	}

    createFow () {
        // determining map cell transparency
        // determine if a tile can be seen through
        // floor can't block the vision
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapHeight, this.mapWidth, isTransparent);

    }
    
    calculateFow(scene: Phaser.Scene, car: Car) {
        this.scene = scene;
        this.car = car;
    
        const px = this.map.worldToTileX(this.car.posX)
        const py = this.map.worldToTileY(this.car.posY)
        const radius = 4;

    let isVisible = (x:number, y:number): boolean => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return false;  
        }
        return true;
    }

    let setVisibility = (x:number, y:number) => {
        this.isTileSeen[x][y] = true;
        console.log("isSeen x:" + x + " y: " + y); 
        const tile = this.roadLayer.getTileAt(x, y);
        if (!tile) {
            return;
        }
        const d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
              new Phaser.Math.Vector2(px, py)));

        if (this.isTileSeen[x][y] === true  && d > radius/2) {
            const tile = this.roadLayer.getTileAt(x, y);
            tile.setAlpha(0.5);
            //tile.tint = 0x404040;
        }  else {
            tile.setAlpha(1);
        }
    }

    this.fow.compute(
    px,
    py,
    radius, 
    isVisible,
    setVisibility);

    }
}  

*/