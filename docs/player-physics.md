# Player Physics

Player movement is defined in the [Player](https://github.com/rahoi/racing-roguelike/blob/main/src/lib/Player.ts) class and can be summarized by the following steps:
1. [Get user input](https://github.com/rahoi/racing-roguelike/blob/main/docs/player-physics.md#1-getting-user-input)
2. [Apply forces](https://github.com/rahoi/racing-roguelike/blob/main/docs/player-physics.md#2-applying-forces)
3. [Calculate Steering](https://github.com/rahoi/racing-roguelike/blob/main/docs/player-physics.md#3-calculating-steering)
4. [Set new position](https://github.com/rahoi/racing-roguelike/blob/main/docs/player-physics.md#4-setting-new-position)

## 1. Getting User Input
```typescript
updateLoc(gas: boolean, brake: boolean, left: boolean, right: boolean, dt: any)
```

[GameScenes's](https://github.com/rahoi/racing-roguelike/blob/main/src/lib/GameScene.ts) update() method calls this method to update the players location each timestep.

Here, the acceleration and steerAngle variables are set based on boolean input values. </br>
Steps 2 through 4 are then called inside this method to get the final player position.

## 2. Applying Forces
```typescript
applyFriction()
```

Here, minimum speed and acceleration are set. </br>
The following vector calculations are computed:

> frictionForce = velocity * friction * offRoadFactor </br>
> dragForce = velocity<sup>2</sup> * drag </br>
> acceleration = acceleration + dragForce + frictionForce

## 3. Calculating Steering
```typescript
calculateSteering(dt: any)
```
After acceleration has been calculated, the player's new direction vector and heading will be calculated.[^1]

**First, simulate front and back wheels:**

Player vehicle is simplified to behave as if it only has two wheels, a front and a back wheel. </br>
We find the wheels' locations by adding/subtracting half the vehicle's pixel size from its initial position.

> backWheel = pos - wheelBase / 2 </br>
> frontWheel = pos + wheelBase / 2

![steering-1](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/steering-1.png)

**Second, determine new wheel locations:**

The backWheel will move along the direction of the original vehicle heading/velocity vector. </br>
The frontWheel will move in the direction of the player's steerAngle.

> backWheel = backWheel + velocity * dt </br>
> frontWheel = frontWheel + velocity.rotated(steerAngle) * dt

![steering-2](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/steering-2.png)

**Third, determine new headingVector and heading angle:**

We then normalize the vector between these two wheel positions and set this as our headingVector. </br>
The angle of this new headingVector will be our new heading angle.

![steering-3](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/steering-3.png)

**Fourth, determine if player is braking or reversing:**

If reversing, stall the player 1 timestep in between stopping and reversing, and take the minimum of velocity and maxReverseSpeed as our velocity.

**Fifth, apply traction through linear interpolation:**

If moving forward, add slide to our vehicle. Higher speeds will have less traction. </br>
The less traction, the more sliding.

> velocity = (headingVector * vel.mag * traction) + (velocity * (1 - traction))

Determine velocity's new direction.

![steering-5](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/steering-5.png)

## 4. Setting new position
```typescript
setPos(dt: any)
```
Calculate the new velocity using the computed acceleration and velocity direction. </br>
Finally, set the position based on this velocity.

> velocity = velocity + acceleration * dt </br>
> pos = pos + velocity

If player is out of bounds, set velocity to 0 and player position at the boundary.

[^1]: Steering algorithm is modeled after a Godot recipe described at [kidscancode.org](https://kidscancode.org/godot_recipes/2d/car_steering/).
