//import Phaser from 'phaser';



export default class oilSpill{
    //player: Player;

    scene: Phaser.Scene;
    oil: Phaser.GameObjects.Sprite;

    addOil(scene: Phaser.Scene) {
        this.scene = scene;
        //this.oil  = new Phaser.GameObjects.Sprite(this.scene, 800, 700, );
        this.scene.add.image(400, 600, 'oil').setOrigin(0.5, 1);
    }

    hazardLoc(scene: Phaser.Scene){
        console.log("hazardLoc()");

        this.scene = scene;
        var text = this.scene.add.text(100, 100, 'OIL', { font: '120px Courier'});
        text.setText(['Hazard']);

        
    }


}