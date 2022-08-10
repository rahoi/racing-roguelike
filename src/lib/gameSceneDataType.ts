/**
 * gameSceneDataType exports the custom type, gameSceneData, 
 * which contains information to be sent to GameScene
 */

export type gameSceneData = {
    id: string,
    image: string, 
    timer: number, 
    currentLevel: number,
    gasKey: string,
    brakeKey: string,
    leftKey: string,
    rightKey: string
}