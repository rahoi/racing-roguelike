# Procedurally Generated Race Tracks

One major roguelike aspect of Racing Roguelike is the procedural generation of race tracks for each level of the game. The maps for each level of the game are built as 2D tilemaps that contain tiles for the race track itself as well as the terrain surrounding it. This is done by first creating a continuous loop. Next, tiles are placed onto the map such that each point on the loop corresponds to a tile on the inner portion of the race track. Next, the race track is expanded to add the points immediately adjacent to the inner loop. This widens the race track so that each section is at least two tiles wide. Finally, tiles for the outer portion of the race track are placed on the map to create a completed, procedurally generated race track.

The general algorithm used to generate the points on the first inital loop can be found on a blog post [here](http://blog.meltinglogic.com/2013/12/how-to-generate-procedural-racetracks/) by Gustavo Maciel.

## Initial Inner Race Track Loop

To create the inital loop for the race track, first an array of random coordinate points is generated. The values of each of the points are based on the tile height and width of the map. The hull that contains these points is then found using the hull.js library. This returns an array of points that make the shape that surrounds the random points. As these points are random, they may be very close together, which could cause issues creating the wider loop later down the line. To resolve this, the points that are too close together are moved apart. Afterwards, the convexity and difficulty of the race track is adjusted by adding points between each point in the current array of race track points, and the points are moved apart once again. The angles between each point is the adjusted such that they are not too small, as this would also lead to issues creating the wider race track later on. Once the angles have been fixed, the resulting shape is smoothened by interpolating the points using Catmull-Rom splines. The spline is then filled in so that there are no missing points along the loop. 

The functions to perform these actions is found in GenerateInnerTrack.

The hull.js library used to find the points on the convex hull encompassing an array of points can be found in the GitHub repo [here](https://github.com/AndriiHeonia/hull) by AndriiHeonia.

The catmull-rom-interpolator library used to interpolate the shape created by an array of points can be found in the GitHub repo [here](https://github.com/rciszek/catmull-rom-interpolator) by rciszek.


## Placing Tiles and Generating the Outer Race Track Loop

Before generating the outer loop, tiles from the terrain spritesheet are placed in a 2D array representing the map, where the coordinates from the inner race track correspond to the height and width of the map. The tile values are found based the coordinate's neighboring points such that the inner portion of the race track is created.

To widen the race track so that it is more than one tile wide, outer race track loop is then created based on the inner loop. First, coordinate points on the map that are touching the outer edge of the inner loop are added to an array. Next, the points on this new loop that are not along the outer edge/rim of the race track are set as "blank" road tiles (tiles that are a part of the road, but not contain any of the curb of the race track). The remaining tiles in the outer race track array are then placed on the map in a similar fashion to placing the inner track tiles, such that the tile for each coordinate is dependent upon the location of its neighboring points.

The functions for these actions is found in PlaceTrackTiles.

The function to perform all of the actions above together and check that the race track does not loop back on itself is found in TrackGeneration.

The function to create the race tracks and store other relevant information, such as the start line location, is found in GenerateMap.

## Phaser Tilemap

To build the Phaser Tilemap for each level, first a new race track is generated in GameScene. The road TilemapLayer for the map is then made from the Tilemap of race track and drawn to the screen by Phaser.