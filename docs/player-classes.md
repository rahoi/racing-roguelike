# Player Classes

The _PlayerFactory_ class generates a Player Factory object (**playerSelection** in [GameScene](https://github.com/rahoi/racing-roguelike/blob/main/src/lib/GameScene.ts)) that creates a new Player type from its createPlayer() method.

Currently, players can select from the following vehicles:
- Car
- Bike
- Truck

Each vehicle has its own unique features that contribute to a unique driving experience. </br>
These features include:

```
wheelBase
steerFactor
enginePower
brakingFactor
maxReverseSpeed
friction
drag
slipSpeed
tractionFast
tractionSlow
offRoadFactor
```
