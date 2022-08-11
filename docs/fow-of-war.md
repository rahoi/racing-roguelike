# Fow of War

The fog of war is the uncertainty in situational awareness experienced by participants in military operations. The term has become commonly used to define uncertainty mechanics in video games. In other words, fog of war in video games refers to enemy units, and often terrain, being hidden from the player; this is lifted once the area is explored, and the information might be fully or partially re-hidden.

## Three States (Fow of war)

The game starts with two states of the fog of war. The first one is the current visibility of the player and the second one refers to the racetrack that is hidden from the player. While the player moves around the racetrack, it will generate a new state of the fow of war. This new state is also known as the player's memory, since the player has a partial visibility of the explored areas. 

## Calculate the fog of war

In order to calculate the fog of war, we used the MRPAS javaScript library, or Mingos' Restrictive Precise Angle Shadowcasting (Precise Angle Shadowcasting for short). This is a field of view (FOV) computation algorithm and was conceived in the year 2008 for the purpose of being used in a roguelike game. It requires a given 2D grid with a source tile (the one marked "@"), while the #'s are obstacles. Also, it uses three angles, to determine a cell's visibility. The green line represents the starting angle, the blue one is the centre angle and the purple one is the end angle. 

(https://github.com/rahoi/racing-roguelike/blob/main/public/assets/fowPicture.png)

For more detailed information about the Mrpas library and Restrictive Precise Angle Shadowcasting Algorithm, you can take a look to the following links:
[Mrpas](http://www.roguebasin.com/index.php?title=Restrictive_Precise_Angle_Shadowcasting)
[Restrictive Precise Angle Shadowcasting Algorithm](https://www.npmjs.com/package/mrpas)