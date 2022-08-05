export default class Vector2 {

    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    set(x: number, y: number) {
        this.x = x
        this.y = y
    }

    setX(x: number) {
        this.x = x
    }

    setY(y: number) {
        this.y = y
    }

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }

    getAngle() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI
    }

    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    rotate(angle: number) {
        let oldX = this.x
        let oldY = this.y
        let newX = Math.cos(angle * Math.PI / 180) * oldX - Math.sin(angle * Math.PI / 180) * oldY
        let newY = Math.sin(angle * Math.PI / 180) * oldX + Math.cos(angle * Math.PI / 180) * oldY
        return new Vector2(newX, newY)
    }

    normalize() {
        let tmp = new Vector2(this.x, this.y)
        let m = tmp.getMagnitude()
        if (m > 0) {
            tmp.x = tmp.x / m
            tmp.y = tmp.y / m
        }
        return tmp
    }

    /* --------- Static vector algebra methods --------- */

    static add(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y)        
    }

    static addScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x + scalar, v.y + scalar)
    }

    static subtract(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y)
    }

    static subtractScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x - scalar, v.y - scalar)
    }

    static multiply(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x * v2.x, v1.y * v2.y)
    }

    static multiplyScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x * scalar, v.y * scalar)
    }

    static divide(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x / v2.x, v1.y / v2.y)
    }

    static divideScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x / scalar, v.y / scalar)
    }

    // dot product
    static dot(v1: Vector2, v2: Vector2) {
        return v1.x * v2.x + v1.y * v2.y
    }

    // linear interpolation
    static lerp(v1: Vector2, v2: Vector2, weight: number) {
        let tmp1 = Vector2.multiplyScalar(v1, weight)
        let tmp2 = Vector2.multiplyScalar(v2, 1 - weight)
        return Vector2.add(tmp1, tmp2)
    }
}
