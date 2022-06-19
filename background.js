// Define the configuration of 
// - the size of the game container
// - The gravity of the world.

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#013220",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var graphics;
var path;
var path2;

var game = new Phaser.Game(config); 

// Loads up all the assets inside the scene
// assets: sprites, background images, in-game sounds, and background music.
// Run 1 time.
function preload () 
{
   this.load.image('treeSmall', 'assets/treeSmall.png');
}

// Position the assets that are already preloaded, animations, physics, etc
// Run 1 time

function create ()
{
   this.add.text(20, 20, "Prototype", {font: "25px Arial", fill: "yellow"});    
   graphics = this.add.graphics();

   /*
   // Model A
   //Images
   this.add.image(430, 115, 'treeSmall');
   this.add.image(500, 110, 'treeSmall');
   this.add.image(470, 120, 'treeSmall');
   
   //external path
   path = new Phaser.Curves.Path(600, 450);
   path.ellipseTo(70, 130, 90, 270, true);   
   path.lineTo(220, 190);
   path.ellipseTo(70, 130, 270, 90, true);
   path.lineTo(600, 450);
   
   //internal path
   path2 = new Phaser.Curves.Path(580, 380);
   path2.ellipseTo(20, 60, 90, 270, true);   
   path2.lineTo(230, 260);
   path2.ellipseTo(20, 60, 270, 90, true);
   path2.lineTo(580, 380);
   */

   
   //Model #B

   //Images
   this.add.image(430, 115, 'treeSmall');
   this.add.image(500, 80, 'treeSmall');
   this.add.image(470, 120, 'treeSmall');
   this.add.image(550, 70, 'treeSmall');
   this.add.image(590, 70, 'treeSmall');
 
   //external path
   path = new Phaser.Curves.Path(600, 450);
   path.lineTo(650, 170); 
   path.ellipseTo(80, 30, 0, 180, true);   
   path.ellipseTo(100, 30, 0, 180, false);   
   path.ellipseTo(80, 30, 0, 180, true);   
   path.lineTo(80, 450);
   path.ellipseTo(80, 30, 180, 0, true);   
   path.ellipseTo(100, 30, 180, 0, false);   
   path.ellipseTo(80, 30, 180, 0, true);  
   
   //internal path
   path2 = new Phaser.Curves.Path(520, 350);
   path2.lineTo(540, 250);
   path2.ellipseTo(30, 10, 0, 180, true);   
   path2.ellipseTo(110, 30, 0, 180, false);   
   path2.ellipseTo(30, 10, 0, 180, true);   
   path2.lineTo(180, 350);
   path2.ellipseTo(30, 10, 180, 0, true);   
   path2.ellipseTo(110, 30, 180, 0, false);   
   path2.ellipseTo(30, 10, 180, 0, true);
   
}

// takes care of everything related to the game logic
// Run 1 time per frame
function update ()
{
   graphics.clear();
   graphics.lineStyle(2, 0xffffff, 1);
   path.draw(graphics);
   path2.draw(graphics);
}

// A sprite is an image that is intended to represent a character, enemy, or some other object in a game.
// A background image is not a sprite — usually the player will not interact with the background at all. 
