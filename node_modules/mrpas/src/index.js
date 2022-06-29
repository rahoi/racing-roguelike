"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mrpas = (function () {
    function Mrpas(mapWidth, mapHeight, isTransparent) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.isTransparent = isTransparent;
    }
    Mrpas.prototype.computeOctantY = function (deltaX, deltaY, data) {
        var startSlopes = [];
        var endSlopes = [];
        var iteration = 1;
        var totalObstacles = 0;
        var obstaclesInLastLine = 0;
        var minSlope = 0;
        var x;
        var y;
        var halfSlope;
        var processedCell;
        var visible;
        var extended;
        var centreSlope;
        var startSlope;
        var endSlope;
        var previousEndSlope;
        for (y = data.originY + deltaY; y >= data.minY && y <= data.maxY; y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (processedCell = Math.floor(minSlope * iteration + 0.5), x = data.originX + (processedCell * deltaX); processedCell <= iteration && x >= data.minX && x <= data.maxX; x += deltaX, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                if (obstaclesInLastLine > 0) {
                    if (!(data.isVisible(x, y - deltaY) &&
                        this.isTransparent(x, y - deltaY)) &&
                        !(data.isVisible(x - deltaX, y - deltaY) &&
                            this.isTransparent(x - deltaX, y - deltaY))) {
                        visible = false;
                    }
                    else {
                        for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
                            if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
                                if (this.isTransparent(x, y)) {
                                    if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                }
                                else {
                                    if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                    else {
                                        startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
                                        endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
                                        extended = true;
                                    }
                                }
                            }
                        }
                    }
                }
                if (visible) {
                    data.setVisible(x, y);
                    if (!this.isTransparent(x, y)) {
                        if (minSlope >= startSlope) {
                            minSlope = endSlope;
                        }
                        else if (!extended) {
                            startSlopes[totalObstacles] = startSlope;
                            endSlopes[totalObstacles++] = endSlope;
                        }
                    }
                }
            }
        }
    };
    Mrpas.prototype.computeOctantX = function (deltaX, deltaY, data) {
        var startSlopes = [];
        var endSlopes = [];
        var iteration = 1;
        var totalObstacles = 0;
        var obstaclesInLastLine = 0;
        var minSlope = 0;
        var x;
        var y;
        var halfSlope;
        var processedCell;
        var visible;
        var extended;
        var centreSlope;
        var startSlope;
        var endSlope;
        var previousEndSlope;
        for (x = data.originX + deltaX; x >= data.minX && x <= data.maxX; x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (processedCell = Math.floor(minSlope * iteration + 0.5), y = data.originY + (processedCell * deltaY); processedCell <= iteration && y >= data.minY && y <= data.maxY; y += deltaY, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                if (obstaclesInLastLine > 0) {
                    if (!(data.isVisible(x - deltaX, y) &&
                        this.isTransparent(x - deltaX, y)) &&
                        !(data.isVisible(x - deltaX, y - deltaY) &&
                            this.isTransparent(x - deltaX, y - deltaY))) {
                        visible = false;
                    }
                    else {
                        for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
                            if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
                                if (this.isTransparent(x, y)) {
                                    if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                }
                                else {
                                    if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                    else {
                                        startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
                                        endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
                                        extended = true;
                                    }
                                }
                            }
                        }
                    }
                }
                if (visible) {
                    data.setVisible(x, y);
                    if (!this.isTransparent(x, y)) {
                        if (minSlope >= startSlope) {
                            minSlope = endSlope;
                        }
                        else if (!extended) {
                            startSlopes[totalObstacles] = startSlope;
                            endSlopes[totalObstacles++] = endSlope;
                        }
                    }
                }
            }
        }
    };
    Mrpas.prototype.setMapDimensions = function (mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    };
    Mrpas.prototype.compute = function (originX, originY, radius, isVisible, setVisible) {
        setVisible(originX, originY);
        var data = {
            minX: Math.max(0, originX - radius),
            minY: Math.max(0, originY - radius),
            maxX: Math.min(this.mapWidth - 1, originX + radius),
            maxY: Math.min(this.mapHeight - 1, originY + radius),
            originX: originX,
            originY: originY,
            radius: radius,
            isVisible: isVisible,
            setVisible: setVisible
        };
        this.computeOctantY(1, 1, data);
        this.computeOctantX(1, 1, data);
        this.computeOctantY(1, -1, data);
        this.computeOctantX(1, -1, data);
        this.computeOctantY(-1, 1, data);
        this.computeOctantX(-1, 1, data);
        this.computeOctantY(-1, -1, data);
        this.computeOctantX(-1, -1, data);
    };
    return Mrpas;
}());
exports.Mrpas = Mrpas;
