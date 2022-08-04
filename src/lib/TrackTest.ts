import ConfigData from "./ConfigData.js"
import TrackGeneration from "./TrackGeneration.js"

const tileDimension = 128;
const tileMapHeight = 100;
const tileMapWidth = 100;
const backgroundColor = '#bc8044';
const tilesetImageSheet = '/assets/spritesheet_tiles.png';
const tileKey = 'tiles;'

let mapConfigData = new ConfigData(backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);

let track:TrackGeneration = new TrackGeneration(mapConfigData);

let coordinates:number[][] = [
    [1,2],
    [100,100],
    [3,4],
    [5,6],
    [1,2],
    [5,6],
    [7,8],
    [9,10],
    [11,12],
    [13,14],
    [15,16],
    [1,2],
    [17,18],
    [19,20],
    // [3,4],
    [1,2],
    [3,4],
    [21, 22],
    [23, 24],
    [25, 26],
    [1,2]
]
let len:number = coordinates.length;
console.log(coordinates);

let map = new Map<string, number[]>();

for (let i = 0; i < coordinates.length; i++) {
    let coordKey:string = JSON.stringify(coordinates[i]);

    if (map.get(coordKey) == null) {
        map.set(coordKey, [i]);
    } else {
        map.set(coordKey, [...map.get(coordKey), i]);
    }
}

// track.createMapArray();
console.log("coordinate length before: ", coordinates.length);

coordinates = track.removeLoops(coordinates);

console.log("coordinate length after: ", coordinates.length);
console.log("map length: ", map.size);

if (len > coordinates.length) {
    console.log(coordinates);
    console.log("remove working");
}