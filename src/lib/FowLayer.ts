import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";
import type TileMapConstruct from "./TileMapConstruct";
//import type Player from "./Player";

const n = 100; // size of the array

export default class FowLayer{
	map: Phaser.Tilemaps.Tilemap;
	roadLayer: Phaser.Tilemaps.TilemapLayer;
	player: Bike | Car;
	camera: Phaser.Cameras.Scene2D.CameraManager;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
    tile: Phaser.Tilemaps.Tile;
    
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
        //this.roadLayer.setDepth(100);
        //this.roadLayer.disableInteractive();
        
        
        /*

        const tileset = this.map.addTilesetImage('blackTile');
        this.roadLayer = this.map.createBlankLayer('fowF', tileset, 0, 0);
        this.roadLayer.fill(0, 0, 0, textureConfig.width, textureConfig.height);
        //this.roadLayer.setAlpha(0.8)
        this.roadLayer.setDepth(30);
        */
        
	}

    cameraFow(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.CameraManager) {
		this.scene = scene;
		this.map = map;
		this.camera = camera
        
		const bounds = new Phaser.Geom.Rectangle(
			this.map.worldToTileX(this.camera.main.worldView.x),
			this.map.worldToTileY(this.camera.main.worldView.y),
			this.map.worldToTileX(this.camera.main.worldView.width),
			this.map.worldToTileY(this.camera.main.worldView.height)
		)
	
		for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
			for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
				if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
					continue;
				}
                //const tile = this.roadLayer.
				const tile = this.roadLayer.getTileAt(x, y);
				if (!tile) {
				 	continue;
				}
                tile.tint = 0x000000;  //black color
                tile.visible = true;

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

    calculateFow(scene: Phaser.Scene, player: Car | Bike, checkpointImage: Phaser.GameObjects.Image) {       
        this.scene = scene;
        this.player = player;
    
         var px = this.map.worldToTileX(this.player.getLocX());
         var py = this.map.worldToTileY((-1) * this.player.getLocY());
         const radius = 4;

        let isVisible = (x:number, y:number): boolean => {
            console.log('calling isVisible');
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return false;  
            }
            return true;
        }

        let setVisibility = (x:number, y:number): void => {
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                tile.visible = true;
                checkpointImage.setVisible(false);
                return;
            }
            var d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
                new Phaser.Math.Vector2(px, py)));

            if (d < radius - 1) {
                this.isTileSeen[x][y] = true;
                tile.tint = 0xffffff;  //white color
                tile.visible = false;

                checkpointImage.setVisible(true);
            } else if (this.isTileSeen[x][y] === true && d > radius/2) {
                tile.tint = 0x3e3e3e;  //gray color
                tile.visible = true;

                checkpointImage.setVisible(false);
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





/*
import { Mrpas } from "mrpas";
import type Bike from "./Bike";
import type Car from "./Car";
import type ConfigData from "./ConfigData";
//import type Player from "./Player";

const n = 100; // size of the array

export default class FowLayer{
	
	player: Bike | Car;
	//camera: Phaser.Cameras.Scene2D.CameraManager;
    camera: Phaser.Cameras.Scene2D.Camera;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tileKey: string;
	scene: Phaser.Scene;
    fow: Mrpas;
    isTileSeen: boolean[][];
    rt: Phaser.GameObjects.RenderTexture;
    roadLayer: any;
    map: Phaser.Tilemaps.Tilemap;
    
	constructor(mapConfigData: ConfigData) {
        this.tileDimension = mapConfigData.tileDimension;
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.tileKey = mapConfigData.tileKey;

        this.isTileSeen = new Array(n).fill(false).map(() => new Array(n).fill(false));
	}

    // mapLayer(scene: Phaser.Scene, map: TileMapConstruct){
    //     this.scene = scene;
    //     this.map = map;
       
    //     const textureConfig = { 
    //         width: this.mapHeight * this.tileDimension,  
    //         height: this.mapHeight * this.tileDimension 
    //     }
    //     const tileset = this.map.tileMap.addTilesetImage(this.tileKey)
    //     this.roadLayer = this.map.tileMap.createLayer(0, tileset, 0, 0);
    //     //this.roadLayer.setDepth(5);
        
    //     //return this.roadLayer;
    //     this.scene.add.sprite(800, 800, 'testing');

    //     this.rt = this.scene.make.renderTexture(textureConfig, true);
    //    // this.rt.fill(0x000000)
    //     //this.rt.setAlpha(0.8)
    //     //this.rt.draw(this.roadLayer)
        
    //     //this.rt.setTint(0x0b0000)      
    //     // return this.rt;
	// }

    

	mapLayer(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap){
        this.scene = scene;
        this.map = map;
       
        const textureConfig = { 
            width: this.mapHeight * this.tileDimension,  
            height: this.mapHeight * this.tileDimension 
        }
        const tileset = this.map.addTilesetImage(this.tileKey)
        this.roadLayer = this.map.createLayer(0, tileset, 0, 0);

        this.createFow();

       // this.roadLayer.setDepth(100);
        
        //this.roadLayer = this.map.createLayer(0, tileset, 0, 0).setDepth(-10);
        
        //return this.roadLayer;
        this.scene.add.sprite(800, 800, 'testing').setDepth(-10);

        this.rt = this.scene.make.renderTexture(textureConfig, true);
       // this.rt.fill(0x000000)
        //this.rt.setAlpha(0.8)
        //this.rt.draw(this.roadLayer)
        
        //this.rt.setTint(0x0b0000)      
        // return this.rt;
	}
    


    private createFow () {
        //determine if a tile can be seen through (floor can't block the vision)
        let isTransparent = (x:number, y:number) => {
            const tile = this.roadLayer.getTileAt(x, y);
            return tile && !tile.collides;  //anything that cannot collide with the car can be seen through
        }
        this.fow = new Mrpas(this.mapWidth, this.mapHeight, isTransparent);
    } 


   
    cameraFow(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.Camera) {
		this.scene = scene;
		this.map = map;
		this.camera = camera
        
		const bounds = new Phaser.Geom.Rectangle(
			this.map.worldToTileX(this.camera.worldView.x),
			this.map.worldToTileY(this.camera.worldView.y),
			this.map.worldToTileX(this.camera.worldView.width),
			this.map.worldToTileY(this.camera.worldView.height)
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


    // cameraFow(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.CameraManager) {
	// 	this.scene = scene;
	// 	this.map = map;
	// 	this.camera = camera

    //     this.createFow();

        
	// 	const bounds = new Phaser.Geom.Rectangle(
	// 		this.map.worldToTileX(this.camera.main.worldView.x),
	// 		this.map.worldToTileY(this.camera.main.worldView.y),
	// 		this.map.worldToTileX(this.camera.main.worldView.width),
	// 		this.map.worldToTileY(this.camera.main.worldView.height)
	// 	)
	
	// 	for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
	// 		for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
	// 			if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
	// 				continue;
	// 			}

	// 			const tile = this.roadLayer.getTileAt(x, y);
	// 			if (!tile) {
	// 			 	continue;
	// 			}
    //             tile.tint = 0x000000;  //black color
	// 		}
	// 	}	
	// }


    calculateFow(scene: Phaser.Scene, player: Car | Bike) {       
        this.scene = scene;
        this.player = player;
    
         var px = this.map.worldToTileX(this.player.getLocX());
         var py = this.map.worldToTileY((-1) * this.player.getLocY());
         const radius = 4;

        let isVisible = (x:number, y:number): boolean => {
            console.log('calling isVisible');
            const tile = this.roadLayer.getTileAt(x, y)
            if (!tile) {
                return false;  
            }
            return true;
        }

        let setVisibility = (x:number, y:number): void => {
            const tile = this.roadLayer.getTileAt(x,y)
            if (!tile) {
                return;
            }
            var d = Math.floor(new Phaser.Math.Vector2(x, y).distance(
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

*/