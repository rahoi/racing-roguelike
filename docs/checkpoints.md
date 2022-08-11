# Checkpoints

To progress to the next level, player's must collect all checkpoints on a level before a countdown timer runs out. The checkpoints are evenly spaced throughout the race track, with the final checkpoint located at the start/finish line, and guide the player around the track from start to finish. The player may also have to complete a number of laps of the race track, which is kept track of using the checkpoints. If the player does not collect all checkpoints before the timer runs out, the game is over and they may choose to play the game again from the very beginning.

## Checkpoint Generation

The checkpoints for each race track are created by dividing the length of the inner race track by the desired number of checkpoints. The coordinates of the checkpoints for each level are stored in an array. The checkpoints are then placed on the map, one at a time, such that the last checkpoint is at the start/finish line. The player continues to collect checkpoints until they've reached the total number of checkpoints, which is the product of the number of checkpoints per lap and the number of laps. 

## Updating Checkpoint Location

Only one checkpoint is placed on the map at a time so the player cannot collect them out of order. The player collides with the current checkpoint when the player's location on the tile map equals the coordinate of the checkpoint. Once there is a collision, the checkpoint location is updated to the next in the array of checkpoints. If the player has collected all the checkpoints on a lap and there are still more laps to complete, the array of checkpoints is looped through again starting from the first checkpoint in the array.

## Checkpoint Visibility

The visibility of the checkpoints is dependent on the player's current location on the map and the fog of war radius. If the coordinate of the current checkpoint is within the radius of the player's current coordinate, the checkpoint will be visible.