# Racing Roguelike

![Racing Roguelike](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/racing-roguelike.png "Racing Roguelike")

## About
Racing Roguelike is a union between two popular gaming genres, racing games and roguelike games. At the start of the game, the player can select which vehicle they'd like to race in and also change the key binds to manuever the vehicle. In each level, the player races against a timer to traverse through a prodecurally generated race track and collect all the checkpoints on the map. If the timer ever reaches 0 before the player can collect all of the checkpoints, the game is over!

## Development Team
The Racing Roguelike development team has been guided by their sponsor, Jon Rahoi ([jonrahoi](https://github.com/jonrahoi)), and consists of:

- Cynthia Carnero ([CynthiaCR](https://github.com/CynthiaCR))
- Ellen Chan ([nahcnelle](https://github.com/nahcnelle))
- Ashley Radford ([ashleyradford](https://github.com/ashleyradford))

## Play the Game

To play the current version of Racing Roguelike, click [here](https://rahoi.github.io/racing-roguelike/)!

## Development Dependencies/Technologies
- Node.js
    - [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
    - Version 16.15.1
- Svelte
    -[https://svelte.dev/](https://svelte.dev/)
    - Version 3.44.0
- Vite
    -[https://vitejs.dev/](https://vitejs.dev/)
    - Version 2.9.9
- Phaser 
    -[https://phaser.io/download/stable](https://phaser.io/download/stable)
    - Version 3.55.2 “Ichika” 
- catmull-rom-interpolator
    -[https://github.com/rciszek/catmull-rom-interpolator](https://github.com/rciszek/catmull-rom-interpolator)
    - Version 1.0.1
- hull.js
    -[https://github.com/AndriiHeonia/hull](https://github.com/AndriiHeonia/hull)
    - Version 1.0.2
- MRPAS
    -[https://bitbucket.org/umbraprojekt/mrpas/src/master/](https://bitbucket.org/umbraprojekt/mrpas/src/master/)
    - 2.0.0

## Development Environment
- Visual Studio Code
    - [https://code.visualstudio.com/download](https://code.visualstudio.com/download)
    - Version 1.63.2
- TypeScript 
    - [https://www.typescriptlang.org/download](https://www.typescriptlang.org/download)
    - Version 4.5.4

## Getting Started
To contribute to Racing Roguelike or branch off and continue the project,

1. Clone the repo
2. Install dependencies
    `npm i`
3. Start the local development server
    `npm run dev`
4. Make changes to the repo
5. View changes on the local server
    [http://localhost:3000/](http://localhost:3000/) (if Port 3000 is not already in use)
6. Bundle files for deployment
    `npm run build`

### Scripts and Usage


### Architectural Diagram
![Architectural Diagram](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/architectural-diagram.png)

### Completed Features
Below are major features of the game that have been implemented and are working in the current version of Racing Roguelike:

- [Procedurally Generated Race Track](https://github.com/rahoi/racing-roguelike/blob/main/docs/checkpoints.md)
- Vehicle Movement
- [Checkpoints](https://github.com/rahoi/racing-roguelike/blob/main/docs/track-generation.md)
- Fog of War
- Different Vehicle Classes
- Timer

### TODO/Future Planned Features
Below are some features that have not been implemented, but are the next steps to pursue:

- Vehicle Power Ups/Items
- Enemies/Obstacles
- Global Leaderboard
