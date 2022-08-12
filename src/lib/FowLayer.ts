import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type ConfigData from "./ConfigData";
import type Player from "./Player";

const n = 40; // size of the Map height and Width
const blackColor = 0x000000;  //black color
const grayColor = 0x3e3e3e;   //gray color
const whiteColor = 0xffffff;  //white color
var isTileLayer = false;

/**
 * It generates three states of the fog of war (also known as field of view) feature. 
 * And, it uses a javaScript library called Mrpas (https://www.npmjs.com/package/mrpas)
 */

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	player: Player;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
    fowRadius: number;


    /**
    * Initialize the map dimensions and receive the fow radius as a parameter
    * @param mapConfigData data about the Phaser game
    * @param fowRadius radius of the visibility of the player (unit tiles not pixels)
    */
	constructor(mapConfigData: ConfigData, fowRadius: number) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.tileKey = mapConfigData.tileKey;

        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false));
        this.fowRadius = fowRadius;
        this.createFow();
	}

    /**
     * create the layer of the map
     * @param map tilemap object that will content the tilemap layer
     */
	mapLayer(map: Phaser.Tilemaps.Tilemap){
        this.map = map;
        isTileLayer = true;
       
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0)	
	}

    /**
     * create the first layer of the fow by coloring the map (complete black)
     * @param scene phaser scene where the first layer (dark mode) will be displayed
     * @param map tilemap object 
     */
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

    /**
     * Instantiate a Mrpas object by passing it the map dimensions 
     * and a callback for determining map cell transparency
     */
    private createFow () {
        //determine if a tile can be seen through (floor can't block the vision)
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y)
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapWidth, this.mapHeight, isTransparent);
    }

    /**
     * Compute the field of view by calling the compute() method (from Mrpas library) 
     * and passing it the origin coordinates, FOV calculation radius and two callbacks: 
     * - one for determining whether a tile has been marked as visible, and 
     * - the other for marking the tiles as visible
     * @param scene phaser scene where the fow will be displayed
     * @param player player object that can be a car, bike or truck object
     */
    calculateFow(scene: Phaser.Scene, player: Player) {       
        this.scene = scene;
        this.player = player;
    
        //x and y coordinates of the player
         var px = this.map.worldToTileX(Math.abs(this.player.getLocX()));
         var py = this.map.worldToTileY(Math.abs(this.player.getLocY()));

        //callback function for determining whether a tile has been marked as visible
        let isVisible = (x:number, y:number): boolean => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return false;  
            }
            return true;
        }

        //callback function for marking a tile as visible
        let setVisibility = (x:number, y:number): void => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return;
            }
            var d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
                new Phaser.Math.Vector2(px, py)));

            // fowRadius - 1 because it removes the irregular corners of
            // the current visibility
            if (d < this.fowRadius -1 ) {
                this.isTileSeen[x][y] = true;
                tile.tint = whiteColor;
            // fowRadius / 2, so the visibility keeps a square shape
            } else if (this.isTileSeen[x][y] === true && d > this.fowRadius / 2 ) {
                tile.tint = grayColor;
            }
        }
        
        this.fow.compute(
            px,
            py,
            this.fowRadius,
            isVisible,
            setVisibility);
    }

    /**
     * @returns the radius of the fow
     */
    getRadius() {
        return this.fowRadius;
    }

    /**
     * 
     * @returns true if is a valid tile layer
     */
    getLayerType() {
        return isTileLayer;
    }

    /**
     * check if a tile is visible
     * @param player object
     * @param radius for the fow
     * @returns true if the tile is visible
     */
    isTileVisible(player: Player, radius:number){
        var posX = player.getLocX();
        var posY = player.getLocY();

        if (posX > radius || posY > radius) {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param radius of the fow
     * @returns true if the radius is valid
     */
    isValidRadius(radius: number) {
        if(radius <= 0) {
            return false;
        }
        return true;
    }
}