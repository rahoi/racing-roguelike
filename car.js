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
    this.load.image('car', 'assets/Cars/car_blue_small_3.png');
}

function create ()
{
    // add player car
    player = this.physics.add.sprite(200, 100, 'car');
    player.setScale(0.65);
    
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
    player.setVelocity(0);

    if (cursors.right.isDown || keys.d.isDown)
    {
        if (cursors.up.isDown || keys.w.isDown) {
            player.angle = 45;
            player.setVelocityY(-160);
        }
        else if (cursors.down.isDown || keys.s.isDown) {
            player.angle = 135;
            player.setVelocityY(160);
        }
        else {
            player.angle = 90;
        }
        player.setVelocityX(160);
    }
    else if (cursors.left.isDown || keys.a.isDown)
    {
        if (cursors.up.isDown || keys.w.isDown) {
            player.angle = -45;
            player.setVelocityY(-160);
        }
        else if (cursors.down.isDown || keys.s.isDown) {
            player.angle = -135;
            player.setVelocityY(160);
        }
        else {
            player.angle = -90;
        }
        player.setVelocityX(-160);
    }
    else if (cursors.up.isDown || keys.w.isDown)
    {
        player.angle = 0;
        player.setVelocityY(-160);
    }
    else if (cursors.down.isDown || keys.s.isDown)
    {
        player.angle = 180;
        player.setVelocityY(160);
    }
}
