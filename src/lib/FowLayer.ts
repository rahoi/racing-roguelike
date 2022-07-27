import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

//const radius = 7;
const fogAlpha = 0.8;

const lightDropoff = [0.7, 0.6, 0.3, 0.1];

// Alpha to transition per ms given maximum distance between desired
// and actual alpha
const alphaPerMs = 0.004;


// Update faster the further away we are from the desired value,
// but restrict the lower bound so we don't get it slowing
// down infinitley.
function updateTileAlpha(desiredAlpha: number, delta: number, tile: Phaser.Tilemaps.Tile) {
    const distance = Math.max(Math.abs(tile.alpha - desiredAlpha), 0.05);
    const updateFactor = alphaPerMs * delta * distance;
    
    if (tile.alpha > desiredAlpha) {
        tile.setAlpha(Phaser.Math.MinSub(tile.alpha, updateFactor, desiredAlpha));
    } else if (tile.alpha < desiredAlpha) {
        tile.setAlpha(Phaser.Math.MaxAdd(tile.alpha, updateFactor, desiredAlpha));
    }
}







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
    isTileSeen: boolean[][];
    lastPos: Phaser.Math.Vector2;

	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;    // height: this.mapHeight * this.tileDimension  //The height
        this.mapWidth = mapConfigData.mapWidth;      // this.mapHeight * this.tileDimension,  //The width
        this.tileKey = mapConfigData.tileKey;

        const n = 100; // size of the array
        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false)); 

        this.createFow();

        this.lastPos = new Phaser.Math.Vector2({ x: -1, y: -1 });
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
                tile.setAlpha(0.1);
                //tile.tint = 0x333333;
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


    // recalculateFow(scene: Phaser.Scene, player: Car | Bike, currPos: Phaser.Math.Vector2) {             
    //     if (!this.lastPos.equals(currPos)) {
    //         this.calculateFow(scene, player, currPos);
    //         this.lastPos = currPos.clone();
    //     }
    // }

    calculateFow(scene: Phaser.Scene, player: Car | Bike) {       
        this.scene = scene;
        this.player = player;
    
        const px = this.map.worldToTileX(this.player.posX)
        const py = this.map.worldToTileY(this.player.posY)
        const radius = 5;

        this.lastPos.x = this.player.posX;
        this.lastPos.y = this.player.posY;

        let isVisible = (x:number, y:number): boolean => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return false;  
        }
        if (tile.tint !== 0xffffff) {
            console.log("isVisible - tile getBounds " + tile.getBounds);
            console.log("isVisible - tile getBottom: " + tile.getBottom);
            console.log("isVisible - tile center x: " + tile.getCenterX);
            console.log("isVisible - tile data " + tile.getTileData);
            this.isTileSeen[x][y] = true;
            return true;
        } else {
            return false;
        }
    }

    let setVisibility = (x:number, y:number) => {
        const tile = this.roadLayer.getTileAt(x, y)
        if (!tile) {
            return;
        }
        //tile.setAlpha(1);
        //tile.tint = 0xffffff;
        console.log("setVisible - tile getBounds " + tile.getBounds);
        console.log("setVisible - tile getBottom: " + tile.getBottom);
        console.log("setVisible - tile center x: " + tile.getCenterX);
        console.log("setVisible - tile data " + tile.getTileData);
            
        const d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
            new Phaser.Math.Vector2(px, py)));

        //tile.tint = 0xffffff;
        //tile.setAlpha(1);

        if (d < radius ) {  //this.isTileSeen[x][y] === true  &&
            this.isTileSeen[x][y] = true; //const tile = this.roadLayer.getTileAt(x, y);
            tile.setAlpha(1);
            //tile.tint = 0x404040;
        }  else if (this.isTileSeen[x][y] === true && d> radius/2) {
            tile.setAlpha(0.5);
        }

    }

        this.fow.compute(
        px,
        py,
        radius, 
        isVisible,
        setVisibility)
    }
}