import { Mrpas } from "mrpas";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	car: Car;
	camera: Phaser.Cameras.Scene2D.CameraManager;
	tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas
    lastPosition: Phaser.Math.Vector2;

	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;    // height: this.mapHeight * this.tileDimension  //The height
        this.mapWidth = mapConfigData.mapWidth;      // this.mapHeight * this.tileDimension,  //The width
        this.tileKey = mapConfigData.tileKey;
        this.lastPosition = new Phaser.Math.Vector2({x: -1, y: -1});
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
					continue
				}

				const tile = this.roadLayer.getTileAt(x, y);
				if (!tile) {
				 	continue
				}
                tile.setAlpha(0.2);
			}
		}	
	}



    createFow () {
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer!.getTileAt(x, y)
            return tile && tile.collides;
        }
        this.fow = new Mrpas(this.mapHeight, this.mapWidth, isTransparent);
    }


    
    calculateFow(scene: Phaser.Scene, car: Car) {
        this.scene = scene;
        this.car = car;
        this.createFow();

        const px = this.map.worldToTileX(this.car.posX)
        const py = this.map.worldToTileY(this.car.posY)
        const radius = 10;
        
        this.fow.compute(
        px,
        py, 
        radius, //Infinity,  
        (x: number, y: number) => {
            const tile = this.roadLayer!.getTileAt(x, y)
            if (!tile) {
                return false
            }
            return tile.alpha > 0
        },
        (x: number, y:number) => {
            const tile = this.roadLayer!.getTileAt(x, y)
            if (!tile) {
                return;
            }
            tile.setAlpha(1);

        })
    }

}