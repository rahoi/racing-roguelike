class GameScene extends Phaser.Scene {
	constructor()
    {
		super({ key: 'GameScene' })
	}

	preload() 
    {
        this.load.image('treeSmall', 'assets/treeSmall.png')
        this.load.image('car', 'assets/Cars/car_blue_small_3.png')
	}

	create() 
    {
        this.add.text(20, 20, "Prototype", {font: "25px Arial", fill: "yellow"})
        gameState.graphics = this.add.graphics();
    
        //Images
        this.add.image(430, 115, 'treeSmall')
        this.add.image(500, 80, 'treeSmall')
        this.add.image(470, 120, 'treeSmall')
        this.add.image(550, 70, 'treeSmall')
        this.add.image(590, 70, 'treeSmall')

        //external path
        gameState.path = new Phaser.Curves.Path(600, 450)
        gameState.path.lineTo(650, 170); 
        gameState.path.ellipseTo(80, 30, 0, 180, true);   
        gameState.path.ellipseTo(100, 30, 0, 180, false);   
        gameState.path.ellipseTo(80, 30, 0, 180, true);   
        gameState.path.lineTo(80, 450);
        gameState.path.ellipseTo(80, 30, 180, 0, true);   
        gameState.path.ellipseTo(100, 30, 180, 0, false);   
        gameState.path.ellipseTo(80, 30, 180, 0, true);  

        //internal path
        gameState.path2 = new Phaser.Curves.Path(520, 350)
        gameState.path2.lineTo(540, 250)
        gameState.path2.ellipseTo(30, 10, 0, 180, true)
        gameState.path2.ellipseTo(110, 30, 0, 180, false)  
        gameState.path2.ellipseTo(30, 10, 0, 180, true) 
        gameState.path2.lineTo(180, 350)
        gameState.path2.ellipseTo(30, 10, 180, 0, true)
        gameState.path2.ellipseTo(110, 30, 180, 0, false)
        gameState.path2.ellipseTo(30, 10, 180, 0, true)

    
        // add player car
        gameState.player = this.physics.add.sprite(200, 200, 'car')
        gameState.player.setScale(0.65)
        
        // set screen bounds
        gameState.player.setCollideWorldBounds(true)

        // add input keys
        gameState.cursors = this.input.keyboard.createCursorKeys()
        gameState.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        })
	}

	update() 
    {
        // draws the background
		gameState.graphics.clear()
        gameState.graphics.lineStyle(2, 0xffffff, 1)
        gameState.path.draw(gameState.graphics)
        gameState.path2.draw(gameState.graphics)

        // updates car location
        gameState.player.setVelocity(0)

        if (gameState.cursors.right.isDown || gameState.keys.d.isDown)
        {
            if (gameState.cursors.up.isDown || gameState.keys.w.isDown) {
                gameState.player.angle = 45
                gameState.player.setVelocityY(-160)
            }
            else if (gameState.cursors.down.isDown || gameState.keys.s.isDown) {
                gameState.player.angle = 135
                gameState.player.setVelocityY(160)
            }
            else {
                gameState.player.angle = 90
            }
            gameState.player.setVelocityX(160)
        }
        else if (gameState.cursors.left.isDown || gameState.keys.a.isDown)
        {
            if (gameState.cursors.up.isDown || gameState.keys.w.isDown) {
                gameState.player.angle = -45
                gameState.player.setVelocityY(-160)
            }
            else if (gameState.cursors.down.isDown || gameState.keys.s.isDown) {
                gameState.player.angle = -135
                gameState.player.setVelocityY(160)
            }
            else {
                gameState.player.angle = -90
            }
            gameState.player.setVelocityX(-160)
        }
        else if (gameState.cursors.up.isDown || gameState.keys.w.isDown)
        {
            gameState.player.angle = 0
            gameState.player.setVelocityY(-160)
        }
        else if (gameState.cursors.down.isDown || gameState.keys.s.isDown)
        {
            gameState.player.angle = 180
            gameState.player.setVelocityY(160)
        }
	}
}
