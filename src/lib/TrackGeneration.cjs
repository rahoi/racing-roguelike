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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var TerrainArray_js_1 = __importDefault(require("./TerrainArray.cjs"));
// works in node, not on browser
var hull_js_1 = __importDefault(require("hull.js"));
var catmull_rom_interpolator_1 = __importDefault(require("catmull-rom-interpolator"));
// import * as three from "three"
var TrackGeneration = /** @class */ (function () {
    function TrackGeneration(mapConfigData) {
        this.mapArray = [];
        this.firstPt = [];
        this.mapHeight = mapConfigData.mapHeight;
        this.mapWidth = mapConfigData.mapWidth;
        this.margin = 0.1; // buffer around screen border
        this.borderWidth = Math.trunc(this.mapWidth * this.margin);
        this.borderHeight = Math.trunc(this.mapHeight * this.margin);
        this.numPts = 20;
    }
    TrackGeneration.prototype.createMapArray = function () {
        // creating mapArray matrix
        var points = this.generateRandomPoints();
        var convexHull = this.findConvexHull(points);
        var numPtMoves = 3;
        var distVal = 10;
        for (var i = 0; i < numPtMoves; ++i) {
            convexHull = this.movePtsApart(convexHull, distVal);
        }
        //push apart again, so we can stabilize the points distances. 
        var adjustedConvexPts = this.adjustConvexity(convexHull);
        // console.log("after convexity");
        // for (let i = 0; i < adjustedConvexPts.length; i++) {
        //     console.log("(", adjustedConvexPts[i][0], ", ", adjustedConvexPts[i][1], ")");
        // }
        // issues with looping after adjusting convexity if movePtsApart
        numPtMoves = 3;
        distVal = 5;
        for (var i = 0; i < numPtMoves; ++i) {
            adjustedConvexPts = this.movePtsApart(adjustedConvexPts, distVal);
        }
        // console.log("after move");
        // for (let i = 0; i < adjustedConvexPts.length; i++) {
        //     console.log("(", adjustedConvexPts[i][0], ", ", adjustedConvexPts[i][1], ")");
        // } 
        var fixedAnglePts = adjustedConvexPts;
        for (var i = 0; i < 1; ++i) {
            fixedAnglePts = this.fixTrackAngles(fixedAnglePts);
            // adjustedPts = this.movePtsApart(adjustedPts);  
        }
        var splinePts = this.findSpline(fixedAnglePts);
        var trackCoordinates = this.fillInTrack(splinePts);
        // let loop:number[][] = this.fillInLoop(fixedAnglePts);
        // fill in mapArray with dirt tile
        for (var i = 0; i < this.mapHeight; i++) {
            var temp = [];
            for (var j = 0; j < this.mapWidth; j++) {
                temp.push(162);
            }
            this.mapArray.push(temp);
        }
        var prev = trackCoordinates[0];
        var curr;
        var next;
        for (var i = 1; i < trackCoordinates.length; i++) {
            curr = trackCoordinates[i];
            next = (i < trackCoordinates.length - 1) ? trackCoordinates[i + 1] : trackCoordinates[1];
            this.determineTileToPlace(prev, curr, next);
            prev = curr;
            // this.mapArray[loop[i][0]][loop[i][1]] = 252;
            // this.mapArray[splinePts[i][0]][splinePts[i][1]] = 221
        }
        this.firstPt = trackCoordinates[0];
        for (var i = 0; i < trackCoordinates.length; i++) {
            console.log("(", trackCoordinates[i][0], ", ", trackCoordinates[i][1], ")");
        }
        // console.log(JSON.stringify(trackCoordinates));
        // console.log(JSON.stringify(this.mapArray))
    };
    TrackGeneration.prototype.generateRandomPoints = function () {
        // generating random points
        var points = [];
        for (var i = 0; i < this.numPts; i++) {
            var temp = [];
            temp[0] = Math.random() * (this.mapHeight - 2 * this.borderHeight) + this.borderHeight;
            temp[1] = Math.random() * (this.mapWidth - 2 * this.borderWidth) + this.borderWidth;
            points.push(temp);
        }
        return points;
    };
    TrackGeneration.prototype.findConvexHull = function (points) {
        // calculating convex hull points
        var concavityVal = 80; // from 1 to inf, closer to 1: hugs shape more
        var convexHull = [];
        convexHull = (0, hull_js_1["default"])(points, concavityVal);
        convexHull.pop();
        return convexHull;
    };
    TrackGeneration.prototype.movePtsApart = function (points, distVal) {
        // let distVal:number = 10; //I found that 15 is a good value, though maybe, depending on your scale you'll need other value.  
        var maxDist = Math.pow(distVal, 2);
        var distBtPts;
        for (var i = 0; i < points.length; ++i) {
            for (var j = i + 1; j < points.length; ++j) {
                distBtPts = (Math.pow((points[j][0] - points[i][0]), 2)) + (Math.pow((points[j][1] - points[i][1]), 2));
                // console.log("dist",distSq)
                if (distBtPts < maxDist) {
                    var dx = points[j][0] - points[i][0];
                    var dy = points[j][1] - points[i][1];
                    var dl = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    dx /= dl;
                    dy /= dl;
                    var diff = distVal - dl;
                    dx *= diff;
                    dy *= diff;
                    points[j][0] += dx;
                    points[j][1] += dy;
                    points[i][0] -= dx;
                    points[i][1] -= dy;
                    points[i] = this.checkPtWithinBorder(points[i]);
                    points[j] = this.checkPtWithinBorder(points[j]);
                }
            }
        }
        return points;
    };
    TrackGeneration.prototype.checkPtWithinBorder = function (coordinate) {
        // if less than border
        var minHeight = this.borderHeight;
        var minWidth = this.borderWidth;
        // if less than border
        coordinate[0] = coordinate[0] < minHeight ? minHeight : coordinate[0];
        coordinate[1] = coordinate[1] < minWidth ? minWidth : coordinate[1];
        // if greater than border
        var maxHeight = this.mapHeight - this.borderHeight;
        var maxWidth = this.mapWidth - this.borderWidth;
        coordinate[0] = coordinate[0] >= maxHeight ? maxHeight : coordinate[0];
        coordinate[1] = coordinate[1] >= maxWidth ? maxWidth : coordinate[1];
        return coordinate;
    };
    TrackGeneration.prototype.adjustConvexity = function (points) {
        var adjustedPoints = [];
        var displacement = [];
        var difficulty = 1; //the closer the value is to 0, the harder the track should be 
        var maxDisp = 10;
        for (var i = 0; i < points.length; ++i) {
            var dispLen = (Math.pow(Math.random(), difficulty)) * maxDisp;
            displacement = [0, 1];
            var rotationRad = (Math.random() * 360) * Math.PI / 180;
            displacement = this.rotatePt(displacement, rotationRad);
            displacement[0] *= dispLen;
            displacement[1] *= dispLen;
            adjustedPoints[i * 2] = points[i];
            adjustedPoints[i * 2 + 1] = points[i];
            var nextPt = void 0;
            nextPt = i < points.length - 1 ? points[i + 1] : points[0];
            var temp = [];
            // midpoint calculation
            temp[0] = (adjustedPoints[i * 2 + 1][0] + nextPt[0]) / 2 + displacement[0];
            temp[1] = (adjustedPoints[i * 2 + 1][1] + nextPt[1]) / 2 + displacement[1];
            temp = this.checkPtWithinBorder(temp);
            adjustedPoints[i * 2 + 1] = temp;
            // adjustedPoints[i * 2 + 1][0] = ((adjustedPoints[i * 2 + 1][0] + (nextPt[0] % points.length)) / 2) + displacement[0];
            // adjustedPoints[i * 2 + 1][1] = ((adjustedPoints[i * 2 + 1][1] + (nextPt[1] % points.length)) / 2) + displacement[1];
        }
        return adjustedPoints;
    };
    TrackGeneration.prototype.rotatePt = function (point, radians) {
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var x = point[0] * cos - point[1] * sin;
        var y = point[0] * sin + point[1] * cos;
        point[0] = x;
        point[1] = y;
        return point;
    };
    TrackGeneration.prototype.fixTrackAngles = function (points) {
        var angle = 95;
        // let prev = points[0];
        for (var i = 0; i < points.length; ++i) {
            var prev = (i - 1 < 0) ? points.length - 1 : i - 1;
            var next = (i + 1) % points.length;
            var px = points[i][0] - points[prev][0];
            var py = points[i][1] - points[prev][1];
            var pl = Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
            px /= pl;
            py /= pl;
            var nx = points[i][0] - points[next][0];
            var ny = points[i][1] - points[next][1];
            nx = -nx;
            ny = -ny;
            var nl = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
            nx /= nl;
            ny /= nl;
            //I got a vector going to the next and to the previous points, normalised.  
            var a = Math.atan2((px * ny - py * nx), (px * nx + py * ny)); // perp dot product between the previous and next point. Google it you should learn about it!  
            if (Math.abs(a * 180 / Math.PI) <= angle)
                continue;
            var nA = angle * Math.sign(a) * Math.PI / 180;
            var diff = nA - a;
            var cos = Math.cos(diff);
            var sin = Math.sin(diff);
            var newX = nx * cos - ny * sin;
            var newY = nx * sin + ny * cos;
            newX *= nl;
            newY *= nl;
            points[next][0] = points[i][0] + newX;
            points[next][1] = points[i][1] + newY;
            // if less than 0
            points[next] = this.checkPtWithinBorder(points[next]);
            //I got the difference between the current angle and 100degrees, and built a new vector that puts the next point at 100 degrees.  
        }
        return points;
    };
    TrackGeneration.prototype.findSpline = function (convexHull) {
        // calculating catmull rom spline points
        // alpha: 0 to 1, centripedal:  0.5, chordal (more rounded): 1
        var alpha = 0.75;
        var ptsBtHull = 2;
        var splinePts = [];
        splinePts = (0, catmull_rom_interpolator_1["default"])(convexHull, alpha, ptsBtHull, true);
        splinePts = (0, catmull_rom_interpolator_1["default"])(convexHull, alpha, ptsBtHull, true);
        splinePts = (0, catmull_rom_interpolator_1["default"])(convexHull, alpha, ptsBtHull, true);
        for (var i = 0; i < splinePts.length; i++) {
            splinePts[i][0] = Math.trunc(splinePts[i][0]);
            splinePts[i][1] = Math.trunc(splinePts[i][1]);
        }
        splinePts.push([splinePts[0][0], splinePts[0][1]]);
        return splinePts;
    };
    TrackGeneration.prototype.fillInTrack = function (splinePts) {
        // filling in polygon
        var trackCoordinates = splinePts;
        var prevPrevInd = -1;
        var prevPt = trackCoordinates[0];
        for (var i = 1; i < trackCoordinates.length; i++) {
            if (prevPt[0] == trackCoordinates[i][0] && prevPt[1] == trackCoordinates[i][1]) {
                trackCoordinates.splice(i, 1);
                i--;
                prevPt = trackCoordinates[i];
                continue;
            }
            if (i == trackCoordinates.length) {
                continue;
            }
            var xDiff = Math.abs(prevPt[0] - trackCoordinates[i][0]);
            var yDiff = Math.abs(prevPt[1] - trackCoordinates[i][1]);
            var tempPt = prevPt;
            // if (xDiff != 0 || yDiff != 0) {
            //     let lengthBeforeFill = trackCoordinates.length;
            //     trackCoordinates = this.fillBtPts(trackCoordinates, i);
            //     i += trackCoordinates.length - lengthBeforeFill;
            // }
            if (xDiff != 0) {
                if (prevPt[0] - trackCoordinates[i][0] > 0) {
                    // console.log("prev x bigger")
                    tempPt = [prevPt[0] - 1, prevPt[1]];
                }
                else if (prevPt[0] - trackCoordinates[i][0] < 0) {
                    // console.log("prev x smaller")
                    tempPt = [prevPt[0] + 1, prevPt[1]];
                }
                if (tempPt == trackCoordinates[prevPrevInd]) {
                    tempPt[0] = trackCoordinates[i][0];
                    tempPt[1] = prevPt[1];
                }
                trackCoordinates.splice(i, 0, tempPt);
                xDiff = Math.abs(prevPt[0] - trackCoordinates[i][0]);
                yDiff = Math.abs(prevPt[1] - trackCoordinates[i][1]);
            }
            if (xDiff == 0 && yDiff != 0) {
                if (prevPt[1] - trackCoordinates[i][1] > 1) {
                    // console.log("prev y bigger")
                    tempPt = [prevPt[0], prevPt[1] - 1];
                    trackCoordinates.splice(i, 0, tempPt);
                }
                else if (prevPt[1] - trackCoordinates[i][1] < 1) {
                    // console.log("prev y smaller")
                    tempPt = [prevPt[0], prevPt[1] + 1];
                    trackCoordinates.splice(i, 0, tempPt);
                }
            }
            prevPrevInd++;
            prevPt = trackCoordinates[i];
        }
        // console.log("loop: ");
        // for (let i = 0; i < loop.length; i++) {
        //     console.log("(", loop[i][0], ", ", loop[i][1], ")");
        // }
        var track = this.removeLoops(trackCoordinates);
        return track;
    };
    TrackGeneration.prototype.fillBtPts = function (trackCoordinates, index) {
        var tempPt = [];
        var prevPt = trackCoordinates[index - 1];
        var currPt = trackCoordinates[index];
        var lastPt = trackCoordinates[index];
        var count = 0;
        while (tempPt != lastPt) {
            tempPt = prevPt;
            if (count % 2 == 0) {
                if (prevPt[0] == currPt[0]) {
                    tempPt[0] = prevPt[0];
                }
                else if (prevPt[0] < currPt[0]) {
                    tempPt[0] = prevPt[0] + 1;
                }
                else if (prevPt[0] > currPt[0]) {
                    tempPt[0] = prevPt[0] - 1;
                }
            }
            else {
                if (prevPt[1] < currPt[1]) {
                    tempPt[1] = prevPt[1] + 1;
                }
                else if (prevPt[1] > currPt[0]) {
                    tempPt[1] = prevPt[1] - 1;
                }
                else {
                    tempPt[1] = prevPt[1];
                }
            }
            if (tempPt != currPt) {
                trackCoordinates.splice(index + count, 0, tempPt);
            }
            count++;
            prevPt = trackCoordinates[index - 1 + count];
            currPt = trackCoordinates[index + count];
        }
        return trackCoordinates;
    };
    TrackGeneration.prototype.removeLoops = function (trackCoordinates) {
        var e_1, _a;
        var coordinates = new Map();
        var originialLength = trackCoordinates.length;
        // fill map with key: coordinate, value: array of indicies from loop
        for (var i = 0; i < trackCoordinates.length - 1; i++) {
            var coordKey = JSON.stringify(trackCoordinates[i]);
            if (coordinates.get(coordKey) == null) {
                coordinates.set(coordKey, [i]);
            }
            else {
                coordinates.set(coordKey, __spreadArray(__spreadArray([], __read(coordinates.get(coordKey)), false), [i], false));
            }
        }
        // if there are duplicate coordinates
        if (coordinates.size < trackCoordinates.length) {
            try {
                for (var coordinates_1 = __values(coordinates), coordinates_1_1 = coordinates_1.next(); !coordinates_1_1.done; coordinates_1_1 = coordinates_1.next()) {
                    var _b = __read(coordinates_1_1.value, 2), coordKey = _b[0], loopIndicesArray = _b[1];
                    if (loopIndicesArray.length >= 2) {
                        console.log("true: ", coordKey);
                        // find shortest loop 
                        var loopStart = void 0;
                        var shortestLoop = void 0;
                        // if already removed one loop, recheck for indices
                        if (originialLength > trackCoordinates.length) {
                            var tempArray = [];
                            for (var i = 0; i < trackCoordinates.length; i++) {
                                if (coordKey == JSON.stringify(trackCoordinates[i])) {
                                    tempArray.push(i);
                                }
                            }
                            loopIndicesArray = tempArray;
                        }
                        // find shortest loop 
                        var lastIndex = false;
                        for (var i = 0; i < loopIndicesArray.length; i++) {
                            if (i == 0) {
                                loopStart = 0;
                                shortestLoop = Math.abs(loopIndicesArray[1] - loopIndicesArray[0]);
                            }
                            else {
                                // let nextIndex:number = (i == loopIndicesArray.length - 1) ? loopIndicesArray[0] : loopIndicesArray[i + 1];
                                var nextIndex = (i == loopIndicesArray.length - 2) ? loopIndicesArray[0] : loopIndicesArray[i + 1];
                                var tempLength = (i == loopIndicesArray.length - 2) ? loopIndicesArray[0] : Math.abs(nextIndex - loopIndicesArray[i]);
                                shortestLoop = Math.min(shortestLoop, tempLength);
                                if (tempLength == shortestLoop) {
                                    lastIndex = (i == loopIndicesArray.length - 2) ? true : false;
                                    loopStart = i;
                                }
                            }
                        }
                        // need to splice accounting for last index
                        // but last index should always == first??
                        if (lastIndex) {
                            // remove first ind, last ind, and 
                            trackCoordinates.splice(trackCoordinates.length - 1, 1);
                            trackCoordinates.splice(0, shortestLoop);
                        }
                        else {
                            trackCoordinates.splice(loopStart, shortestLoop);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (coordinates_1_1 && !coordinates_1_1.done && (_a = coordinates_1["return"])) _a.call(coordinates_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return trackCoordinates;
    };
    TrackGeneration.prototype.determineTileToPlace = function (prev, curr, next) {
        if (prev[0] == curr[0]) {
            if (next[0] == curr[0]) {
                this.fillHorizontal(curr);
            }
            else if (prev[1] < curr[1]) {
                if (next[0] < curr[0]) {
                    this.fillSE(curr);
                }
                else if (next[0] > curr[0]) {
                    this.fillNE(curr);
                }
            }
            else if (prev[1] > curr[1]) {
                if (next[0] < curr[0]) {
                    this.fillSW(curr);
                }
                else if (next[0] > curr[0]) {
                    this.fillNW(curr);
                }
            }
        }
        else if (prev[1] == curr[1]) {
            if (next[1] == curr[1]) {
                this.fillVertical(curr);
            }
            else if (prev[0] < curr[0]) {
                if (next[1] < curr[1]) {
                    this.fillSE(curr);
                }
                else if (next[1] > curr[1]) {
                    this.fillSW(curr);
                }
            }
            else if (prev[0] > curr[0]) {
                if (next[1] < curr[1]) {
                    this.fillNE(curr);
                }
                else if (next[1] > curr[1]) {
                    this.fillNW(curr);
                }
            }
        }
    };
    TrackGeneration.prototype.fillHorizontal = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].horizontal;
    };
    TrackGeneration.prototype.fillVertical = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].vertical;
    };
    TrackGeneration.prototype.fillNW = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].NW;
    };
    TrackGeneration.prototype.fillNE = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].NE;
    };
    TrackGeneration.prototype.fillSE = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].SE;
    };
    TrackGeneration.prototype.fillSW = function (mapCoord) {
        this.mapArray[mapCoord[0]][mapCoord[1]] = TerrainArray_js_1["default"].SW;
    };
    return TrackGeneration;
}());
exports["default"] = TrackGeneration;
