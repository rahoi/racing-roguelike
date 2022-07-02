import mapData from "./MapData.mjs"
// works in node, not on broswer
import hull from "hull.js"
import catmulRomInterpolation from "catmull-rom-interpolator"
// do not work in node nor browser
// import hull from "../node_modules/hull.js/src/hull.js"
// import catmulRomInterpolation from "../node_modules/catmull-rom-interpolator"

const points = []

const margin = 0.1  // buffer around screen border
const border = Math.trunc(mapData.mapWidth * margin)

for (let i = 0; i < 5; i++) {
    let temp = []
    temp[0] = Math.random() * (mapData.mapWidth - 2 * border) + border
    temp[1] = Math.random() * (mapData.mapWidth - 2 * border) + border

    points.push(temp)
}

let concavityVal = 20   // from 1 to inf
let convexHull = hull(points, concavityVal)

let splinePts = catmulRomInterpolation(convexHull, 0.5, 5, false)
for (let i = 0; i < splinePts.length; i++) {
    splinePts[i][0] = Math.trunc(splinePts[i][0])
    splinePts[i][1] = Math.trunc(splinePts[i][1])
}

// console.log(JSON.stringify(points))
// console.log(JSON.stringify(convexHull))
console.log(JSON.stringify(splinePts))

export default splinePts
