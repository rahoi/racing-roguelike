import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

const n = 100; // size of the array

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	player: Car | Bike;
	camera: Phaser.Cameras.Scene2D.CameraManager;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
    
	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.tileKey = mapConfigData.tileKey;

        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false));
        this.createFow();
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
                tile.tint = 0x000000;  //black color
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
    
        const px = this.map.worldToTileX(this.player.posX);
        const py = this.map.worldToTileY(this.player.posY);
        const radius = 4;

        let isVisible = (x:number, y:number): boolean => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return false;  
            }
            return true;
        }

        let setVisibility = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return;
            }
            const d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
                new Phaser.Math.Vector2(px, py)));
            if (d < radius - 1) {
                this.isTileSeen[x][y] = true;
                tile.tint = 0xffffff;  //white color
            } else if (this.isTileSeen[x][y] === true && d > radius/2) {
                tile.tint = 0x3e3e3e;  //gray color
            }
        }

        this.fow.compute(
        px,
        py,
        Infinity, 
        isVisible,
        setVisibility);
    }
}