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
}
