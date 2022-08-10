
import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";

const n = 40; // size of Map height and Width
const blackColor = 0x000000;  //black color
const grayColor = 0x3e3e3e;   //gray color
const whiteColor = 0xffffff;  //white color

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	player: Bike | Car;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
    fowRadius: number;
    //textureConfig: { width: number; height: number; };
    
	constructor(mapConfigData: ConfigData, fowRadius: number) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.tileKey = mapConfigData.tileKey;

        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false));

        this.fowRadius = fowRadius;
        this.createFow();
	}

	mapLayer(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){
        this.scene = scene;
        this.map = map;
       
        var textureConfig = { 
            width: this.mapHeight * this.tileDimension,  
            height: this.mapHeight * this.tileDimension 
        }

        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0)	
        
        this.createFirstLayer(this.scene, this.map)
	}

    createFirstLayer(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
		this.scene = scene;
		this.map = map;
		
        for (let y = 0; y < this.map.height; y++) {
			for (let x = 0; x < this.map.width; x++) {
				if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
					continue;
				}
				const tile = this.roadLayer.getTileAt(x, y);
				if (!tile) {
				 	continue;
				}
                tile.tint = blackColor;
			}
		}
	}

    private createFow () {
        //determine if a tile can be seen through (floor can't block the vision)
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapWidth, this.mapHeight, isTransparent);
    }

    calculateFow(scene: Phaser.Scene, player: Car | Bike) {       
        this.scene = scene;
        this.player = player;
    
         var px = this.map.worldToTileX(Math.abs(this.player.getLocX()));
         var py = this.map.worldToTileY(Math.abs(this.player.getLocY()));

        let isVisible = (x:number, y:number): boolean => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return false;  
            }
            return true;
        }

        let setVisibility = (x:number, y:number): void => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return;
            }
            var d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
                new Phaser.Math.Vector2(px, py)));

            if (d < this.fowRadius - 1) {
                this.isTileSeen[x][y] = true;
                tile.tint = whiteColor;
            } else if (this.isTileSeen[x][y] === true && d > this.fowRadius/2) {
                tile.tint = grayColor;
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