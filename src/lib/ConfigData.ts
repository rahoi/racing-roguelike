export default class ConfigData {
    backgroundColor: string;
    tileDimension: number;
    mapHeight: number;
    mapWidth: number;
    tilesetImageSheet: string;
    tileKey: string

    constructor(backgroundColor: string, tileDimension: number, mapHeight: number, mapWidth: number, tilesetImageSheet: string, tileKey: string) {
        this.backgroundColor = backgroundColor;
        this.tileDimension = tileDimension;
        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;
        this.tilesetImageSheet = tilesetImageSheet;
        this.tileKey = tileKey;
    }
}
