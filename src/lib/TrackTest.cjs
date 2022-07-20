"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ConfigData_js_1 = __importDefault(require("./ConfigData.cjs"));
var TrackGeneration_js_1 = __importDefault(require("./TrackGeneration.cjs"));
var tileDimension = 128;
var tileMapHeight = 100;
var tileMapWidth = 100;
var backgroundColor = '#bc8044';
var tilesetImageSheet = '/assets/spritesheet_tiles.png';
var tileKey = 'tiles;';
var mapConfigData = new ConfigData_js_1["default"](backgroundColor, tileDimension, tileMapHeight, tileMapWidth, tilesetImageSheet, tileKey);
var track = new TrackGeneration_js_1["default"](mapConfigData);
var coordinates = [
    [1, 2],
    [100, 100],
    [3, 4],
    [5, 6],
    [1, 2],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1, 2],
    [17, 18],
    [19, 20],
    [1, 2],
    [3, 4],
    [1, 2]
];
var len = coordinates.length;
var map = new Map();
for (var i = 0; i < coordinates.length; i++) {
    var coordKey = JSON.stringify(coordinates[i]);
    if (map.get(coordKey) == null) {
        map.set(coordKey, [i]);
    }
    else {
        map.set(coordKey, __spreadArray(__spreadArray([], __read(map.get(coordKey)), false), [i], false));
    }
}
// track.createMapArray();
console.log(coordinates.length);
coordinates = track.removeLoops(coordinates);
console.log(coordinates.length);
console.log(map);
if (len > coordinates.length) {
    console.log("remove working");
}
