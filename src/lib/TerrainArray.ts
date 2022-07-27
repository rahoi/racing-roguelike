type terrainArrayData = {
    roadTileArray: number[],
    terrainTileArray: number[],

    x_NW: number[],
    y_NW: number[],
    x_NE: number[],
    y_NE: number[],
    x_SE: number[],
    y_SE: number[],
    x_SW: number[],
    y_SW: number[],
    diag_NW: number,
    diag_NE: number,
    diag_SE: number,
    diag_SW: number,
    corner_NW: number,
    corner_NE: number,
    corner_SE: number,
    corner_SW: number,
    straight_up:number,
    straight_down:number,
    straight_left:number,
    straight_right:number,
    finish_up:number,
    finish_down:number,
    finish_left:number,
    finish_right:number,
    road:number,

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

    corner_NW: 15,
    corner_NE: 14,
    corner_SE: 4,
    corner_SW: 5,

    straight_up: 54,
    straight_down: 53,
    straight_left: 55,
    straight_right: 52,

    finish_up: 49,
    finish_down: 58,
    finish_left: 48,
    finish_right: 59,

    road: 79,

    grass_NW: 60,
    grass_NE: 62,
    grass_SE:82,
    grass_SW:80,
    grass_up:61,
    grass_down:81,
    grass_left:70,
    grass_right:72,
    grass:71,

    dirt: 74,
}

export default terrainArray

    // red road tiles
    // roadTileArray: [
    //     1, 2, 3, 4, 5, 
    //     19, 20, 21, 22, 23, 
    //     37, 38, 39, 40, 41, 
    //     55, 56, 57, 58, 59, 
    //     73, 74, 75, 76, 77, 
    //     91, 92, 93, 94, 95, 
    //     109, 110, 111, 112, 113, 
    //     127, 128, 129, 130, 131,
    //     145, 146, 147, 148, 149,
    //     163, 164, 165, 166, 167, //10 se: 165, ne: 167
    //     181, 182, 183, 184, 185,
    //     199, 200, 201, 202, 203, //12 sw: 201, nw: 203 
    //     217, 218, 219, 220, 221, //13 horizontal: 221
    //     235, 236, 237, 238, 239, //14 vertical: 239
    //     252, 253, 254, 255, 256,
    //     270, 271, 272, 273, 274,
    //     288, 289, 290, 291, 292,
    //     306, 307, 308, 309, 310
    // ],

    // terrainTileArray: [
    //     0, 18, 36, 54, 72, 90, 108, 126, 144, 162, 180, 198, 216, 234
    // ],

    // horizontal: 221,
    // vertical: 239,
    // NW: 203,
    // NE: 167,
    // SE: 308, //165,
    // SW: 201