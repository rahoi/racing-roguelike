type terrainArrayData = {
    roadTileArray:number[],
    terrainTileArray:number[],

    x_NW:number[],
    y_NW:number[],
    x_NE:number[],
    y_NE:number[],
    x_SE:number[],
    y_SE:number[],
    x_SW:number[],
    y_SW:number[],

    diag_NW:number,
    diag_NE:number,
    diag_SE:number,
    diag_SW:number,
    diagonals:number[],

    corner_NW:number,
    corner_NE:number,
    corner_SE:number,
    corner_SW:number,
    corners:number[],

    straight_up:number,
    straight_down:number,
    straight_left:number,
    straight_right:number,
    straights: number[],

    finish_up:number,
    finish_down:number,
    finish_left:number,
    finish_right:number,
    finishes: number[],

    blank_road:number,
    all_roads:number[],

    grass_NW:number,
    grass_NE:number,
    grass_SE:number,
    grass_SW:number,
    grass_up:number,
    grass_down:number,
    grass_left:number,
    grass_right:number,
    grass:number,

    dirt:number
}

let roadTiles:number[] = [...Array(60).keys(), 69, 79];

let terrainTiles:number[] = [...Array(36).keys(), ].map(i => i + 60);
terrainTiles.splice(19, 1); 
terrainTiles.splice(9, 1); 

let terrainArray: terrainArrayData = {
    // from 0-59, 69, 79
    roadTileArray: roadTiles,

    // from 60-95, not 69 or 79
    terrainTileArray: terrainTiles,

    
    x_NW: [32, 22, 23],
    y_NW: [1, 0, 10],    
    x_NE: [35, 25, 24],
    y_NE: [30, 31, 41],
    x_SE: [33, 43, 42],
    y_SE: [20, 21, 11],
    x_SW: [34, 44, 45],
    y_SW: [51, 50, 40],

    diag_NW: 2,
    diag_NE: 3,
    diag_SE: 13,
    diag_SW: 12,
    diagonals: [2, 3, 13, 12],

    corner_NW: 15,
    corner_NE: 14,
    corner_SE: 4,
    corner_SW: 5,
    corners: [15, 14, 4, 5],

    straight_up: 54,
    straight_down: 53,
    straight_left: 55,
    straight_right: 52,
    straights: [54, 53, 55, 52],

    finish_up: 49,
    finish_down: 58,
    finish_left: 48,
    finish_right: 59,
    finishes: [49, 58, 48, 59],

    blank_road: 79,
    all_roads: [
        32, 22, 23, 1, 0, 10, 35, 
        25, 24, 30, 31, 41, 33, 43, 
        42, 20, 21, 11, 34, 44, 45, 
        51, 50, 40, 2, 3, 13, 12, 
        15, 14, 4, 5, 54, 53, 55, 
        52, 49, 58, 48, 59, 9
    ],

    grass_NW: 60,
    grass_NE: 62,
    grass_SE: 82,
    grass_SW: 80,
    grass_up: 61,
    grass_down: 81,
    grass_left: 70,
    grass_right: 72,
    grass: 71,

    dirt: 74,
}

export default terrainArray