export declare type IsTransparentFunc = (x: number, y: number) => boolean;
export declare type IsVisibleFunc = (x: number, y: number) => boolean;
export declare type SetVisibleFunc = (x: number, y: number) => void;
export declare class Mrpas {
    private mapWidth;
    private mapHeight;
    private readonly isTransparent;
    constructor(mapWidth: number, mapHeight: number, isTransparent: IsTransparentFunc);
    private computeOctantY;
    private computeOctantX;
    setMapDimensions(mapWidth: number, mapHeight: number): void;
    compute(originX: number, originY: number, radius: number, isVisible: IsVisibleFunc, setVisible: SetVisibleFunc): void;
}
