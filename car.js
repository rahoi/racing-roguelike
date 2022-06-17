var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var cursors;
var keys;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('car', 'assets/Cars/sedan_blue.png');
}

function create ()
{
    // add player car
    player = this.physics.add.sprite(200, 100, 'car');
    player.setScale(1.5);
    
    // set screen bounds
    player.setCollideWorldBounds(true);

    // add input keys
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
    });
}

function update ()
{
    if (cursors.right.isDown || keys.d.isDown) {
        player.flipX = false;
        player.setVelocityX(160);
    }
    else if (cursors.left.isDown || keys.a.isDown) {
        player.flipX = true;
        player.setVelocityX(-160);
    }
    else {
        player.setVelocityX(0);
    }
    
    if (cursors.up.isDown || keys.w.isDown) {
        player.setVelocityY(-160);
    }
    else if (cursors.down.isDown || keys.s.isDown) {
        player.setVelocityY(160);
    }
    else {
        player.setVelocityY(0);
    }
}
