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

    add(v: Vector2) {
        this.x += v.x
        this.y += v.y

        return this
    }

    addScalar(scalar: number) {
        this.x += scalar
        this.y += scalar

        return this
    }

    subtract(v: Vector2) {
        this.x -= v.x
        this.y -= v.y

        return this
    }

    subtractScalar(scalar: number) {
        this.x -= scalar
        this.y -= scalar

        return this
    }

    multiply(v: Vector2) {
        this.x *= v.x
        this.y *= v.y

        return this
    }

    multiplyScalar(scalar: number) {
        this.x *= scalar
        this.y *= scalar

        return this
    }

    divide(v: Vector2) {
        this.x /= v.x
        this.y /= v.y

        return this
    }

    divideScalar(scalar: number) {
        this.x /= scalar
        this.y /= scalar

        return this
    }

    rotated(angle: number) {
        this.x = Math.cos(angle * Math.PI / 180) * this.x - Math.sin(angle * Math.PI / 180) * this.y
        this.y = Math.sin(angle * Math.PI / 180) * this.x + Math.cos(angle * Math.PI / 180) * this.y

        return this
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalized() {
        let m = this.magnitude()
        if (m > 0) {
            this.divideScalar(m)
        }

        return this
    }

    angle() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI
    }
}
