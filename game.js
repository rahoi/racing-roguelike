const gameState = {}

const config = 
{
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#013220",
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [GameScene]
}

const game = new Phaser.Game(config)