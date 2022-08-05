export type coordinate = {
    index:number;
    numNeighbors:number;
    downVert?:number[];  // neighrbor has bigger x (first coord)
    upVert?:number[];  // neighbor has smaller x
    leftHorz?:number[];  // neighrbor has smaller y (second coord)
    rightHorz?:number[];  // neighrbor has bigger y
}