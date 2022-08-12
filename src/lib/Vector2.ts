/**
 * Library defining a vector2 type and vector2 calculations
 */
export default class Vector2 {

    x: number
    y: number

    /**
     * Stores x and y coordinates
     * @param x coordinate
     * @param y coordinate
     */
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    /**
     * Modifies x and y coordinates
     * @param x 
     * @param y 
     */
    set(x: number, y: number) {
        this.x = x
        this.y = y
    }

    /**
     * Modifies x coordinate
     * @param x coordinate
     */
    setX(x: number) {
        this.x = x
    }

    /**
     * Modifies y coordinate
     * @param y coordinate
     */
    setY(y: number) {
        this.y = y
    }

    /**
     * Gets x coordinate
     * @returns x coordinate
     */
    getX() {
        return this.x
    }

    /**
     * Gets y coordinate
     * @returns y coordinate
     */
    getY() {
        return this.y
    }

    /**
     * Finds this vector's angle via arctan
     * @returns this vector's angle
     */
    getAngle() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI
    }

    /**
     * Finds this vector's magnitude
     * @returns this vector's magnitude
     */
    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    /**
     * Rotates this vector without modification
     * @param angle amount in degrees to rotate
     * @returns newly rotated vector
     */
    rotate(angle: number) {
        let oldX = this.x
        let oldY = this.y
        let newX = Math.cos(angle * Math.PI / 180) * oldX - Math.sin(angle * Math.PI / 180) * oldY
        let newY = Math.sin(angle * Math.PI / 180) * oldX + Math.cos(angle * Math.PI / 180) * oldY
        return new Vector2(newX, newY)
    }

    /**
     * Normlaizs this vector without modification
     * @returns newly normalized vector
     */
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

    /**
     * Adds vector v1 and v2
     * @param v1 vector 1
     * @param v2 vector 2
     * @returns new vector
     */
    static add(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y)        
    }

    /**
     * Adds a scalar to vector v
     * @param v vector
     * @param scalar number
     * @returns new scaled vector
     */
    static addScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x + scalar, v.y + scalar)
    }

    /**
     * Subtracts vector v2 from vector v1
     * @param v1 vector 1
     * @param v2 vector 2
     * @returns new vector
     */
    static subtract(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y)
    }

    /**
     * Subtracts a scalar from vector v
     * @param v vector
     * @param scalar number
     * @returns new scaled vector
     */
    static subtractScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x - scalar, v.y - scalar)
    }

    /**
     * Multiplies vector v1 and v2
     * @param v1 vector 1
     * @param v2 vector 2
     * @returns new vector
     */
    static multiply(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x * v2.x, v1.y * v2.y)
    }

    /**
     * Multiplies vector v by scalar
     * @param v vector
     * @param scalar number
     * @returns new vector
     */
    static multiplyScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x * scalar, v.y * scalar)
    }

    /**
     * Divides vector v1 by v2
     * @param v1 vector 1
     * @param v2 vector 2
     * @returns new vector
     */
    static divide(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x / v2.x, v1.y / v2.y)
    }

    /**
     * Divides vector v by scalar
     * @param v vector
     * @param scalar number
     * @returns new vector
     */
    static divideScalar(v: Vector2, scalar: number) {
        return new Vector2(v.x / scalar, v.y / scalar)
    }

    /**
     * Calculates the dot product of v1 and v2
     * @param v1 vector 1
     * @param v2 vector 2
     * @returns new vector
     */
    static dot(v1: Vector2, v2: Vector2) {
        return v1.x * v2.x + v1.y * v2.y
    }

    /**
     * Linear interpolation of v1 and v2
     * @param v1 vector 1
     * @param v2 vector 2
     * @param weight number
     * @returns new vector
     */
    static lerp(v1: Vector2, v2: Vector2, weight: number) {
        let tmp1 = Vector2.multiplyScalar(v1, weight)
        let tmp2 = Vector2.multiplyScalar(v2, 1 - weight)
        return Vector2.add(tmp1, tmp2)
    }
}
