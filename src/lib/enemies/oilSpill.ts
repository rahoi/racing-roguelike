//import Phaser from 'phaser'

export default class oilSpill{

    scene: Phaser.Scene;

    oilSpillLoc(){
        var text = this.scene.add.text(100, 100, '', { font: '64px Courier'});

        text.setText([
            'Hazard: ' + this.scene.data.get('oil Spill'),
        ]);

    }
}