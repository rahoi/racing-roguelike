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
- Jest
    - [https://jestjs.io/](https://jestjs.io/)
    - Version 28.0.7
- Svelte
    - [https://svelte.dev/](https://svelte.dev/)
    - Version 3.49.0
- Vite
    - [https://vitejs.dev/](https://vitejs.dev/)
    - Version 2.9.9
- Phaser 
    - [https://phaser.io/download/stable](https://phaser.io/download/stable)
    - Version 3.55.2 “Ichika” 
- catmull-rom-interpolator
    - [https://github.com/rciszek/catmull-rom-interpolator](https://github.com/rciszek/catmull-rom-interpolator)
    - Version 1.0.1
- hull.js
    - [https://github.com/AndriiHeonia/hull](https://github.com/AndriiHeonia/hull)
    - Version 1.0.2
- MRPAS
    - [https://bitbucket.org/umbraprojekt/mrpas/src/master/](https://bitbucket.org/umbraprojekt/mrpas/src/master/)
    - 2.0.0

## Development Environment
- Visual Studio Code
    - [https://code.visualstudio.com/download](https://code.visualstudio.com/download)
    - Version 1.63.2
- TypeScript 
    - [https://www.typescriptlang.org/download](https://www.typescriptlang.org/download)
    - Version 4.7.4

## Getting Started
To contribute to Racing Roguelike or branch off and continue the project,

1. Clone the repo
2. Install dependencies
    - `npm i`
3. Start the local development server
    - `npm run dev`
4. Make changes to the repo
5. View changes on the local server
    - [http://localhost:3000/](http://localhost:3000/) (if port 3000 is not already in use)
6. Add tests to the [tests](https://github.com/rahoi/racing-roguelike/tree/main/tests) folder
7. Run tests and verify test results
    - `npm test`
8. For building and deployment:
    - If pushing to the main branch on this repo, [deploy.yml](https://github.com/rahoi/racing-roguelike/blob/main/.github/workflows/deploy.yml) will automatically start a GitHub Action to build and deploy the updated project to [this](https://rahoi.github.io/racing-roguelike/) GitHub Pages site
    - If branching off and continuing the project on your own, you'll have to either set up GitHub Pages for your own repo, or delete [deploy.yml](https://github.com/rahoi/racing-roguelike/blob/main/.github/workflows/deploy.yml) and run `npm run build` to build for deployment and deploy onto a site of your choosing

### Scripts and Usage
- [deploy.yml](https://github.com/rahoi/racing-roguelike/blob/main/.github/workflows/deploy.yml)
    - starts a GitHub Action to build the project, then deploy to GitHub pages

### Architectural Diagram
![Architectural Diagram](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/architectural-diagram.png)

### Scene Flowchart
![Scene Diagram](https://github.com/rahoi/racing-roguelike/blob/main/public/assets/scene-diagram.png)

### Completed Features
Below are major features of the game that have been implemented and are working in the current version of Racing Roguelike:

- [Procedurally Generated Race Track](https://github.com/rahoi/racing-roguelike/blob/main/docs/track-generation.md)
- Vehicle Movement
- [Fog of War](https://github.com/rahoi/racing-roguelike/blob/main/docs/fow-of-war.md)
- [Checkpoints](https://github.com/rahoi/racing-roguelike/blob/main/docs/checkpoints.md)
- Different Vehicle Classes
- [Timer](https://github.com/rahoi/racing-roguelike/blob/main/docs/timer.md)

### TODO/Future Planned Features
Below are some features that have not been implemented, but are the next steps to pursue:

- Vehicle Power Ups/Items
- Enemies/Obstacles
- Global Leaderboard

### Credits
Special thanks to

- [Kenney](https://www.kenney.nl/assets/racing-pack) for the awesome assets for the vehicles and map
- [Freesound](https://freesound.org/) for the incredible sound
- [Icons8](https://icons8.com/icons/set/timer) for a beautiful timer icon

