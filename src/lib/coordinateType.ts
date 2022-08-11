/**
 * coordinateType exports the custom type, coordinate, 
 * which contains information to be used to procedurally generate the race track,
 * and used in TrackGeneration, GenerateInnerTrack, and PlaceTrackTiles
 */

export type coordinate = {
    index:number;   // index of the coordinate in the track array
    numNeighbors:number;

    // orthogonal neighbors of the coordinate
    downVert?:number[];  // neighrbor has bigger height value (first coord)
    upVert?:number[];  // neighbor has smaller height value
    leftHorz?:number[];  // neighrbor has smaller width value (second coord)
    rightHorz?:number[];  // neighrbor has bigger width value
}