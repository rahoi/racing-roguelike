import { Mrpas } from "mrpas"
import type Car from "./Car";

export default class FowLayer{
	fov: Mrpas
	map: Phaser.Tilemaps.Tilemap
	roadLayer: Phaser.Tilemaps.Tilemap
	car: Car;
	camera: Phaser.Cameras.Scene2D.CameraManager;

	constructor() {
		
		var sum = (x: number, y: number) => { const tile = this.roadLayer.getTileAt(x, y)}
		console.log(sum);

		//console.log(this.roadLayer.getTileAt(300,500)); 
		this.fov = new Mrpas(800, 600, (x, y) => {
			const tile = this.roadLayer!.getTileAt(x, y)
			return tile && tile.collides;
		})
	}

}