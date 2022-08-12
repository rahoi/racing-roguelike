import Vector2 from "../src/lib/Vector2"
import {expect, test} from '@jest/globals'

/**
 * Tests methods in Vectoe2 class
 */

// createdvector dummies
let vec1:Vector2 = new Vector2(0,0)
let vec2:Vector2 = new Vector2(1,1)
let vec3:Vector2 = new Vector2(2,3)
let vec4:Vector2 = new Vector2(3,4)


// -------------------------------Method Tests-------------------------------

/* test getAngle() method */
test('get angle of vector', () => {
    expect(vec1.getAngle()).toBe(0);
    expect(vec2.getAngle()).toBe(45);
});

/* test getMagnitude() method */
test('get magnitude of vector', () => {
    expect(vec1.getMagnitude()).toBe(0);
    expect(vec4.getMagnitude()).toBe(5);
});

/* test rotate() method */
test('rotate vector', () => {
    expect(vec2.rotate(90).getX()).toBeCloseTo(-1);
    expect(vec2.rotate(90).getY()).toBeCloseTo(1);
    expect(vec3.rotate(270).getX()).toBeCloseTo(3);
    expect(vec3.rotate(270).getY()).toBeCloseTo(-2);
});

/* test normalize() method */
test('normalize vector', () => {
    expect(vec3.normalize().getX()).toBeCloseTo(0.5547);
    expect(vec3.normalize().getY()).toBeCloseTo(0.8320);
    expect(vec4.normalize()).toStrictEqual(new Vector2(0.6, 0.8));
});

// --------------------------------Static Tests--------------------------------

/* test add() static method */
test('add two vectors', () => {
    expect(Vector2.add(vec1, vec2)).toStrictEqual(new Vector2(1, 1));
    expect(Vector2.add(vec3, vec4)).toStrictEqual(new Vector2(5, 7));
});

/* test addScalar() static method */
test('add to a vector', () => {
    expect(Vector2.addScalar(vec1, 300)).toStrictEqual(new Vector2(300, 300));
    expect(Vector2.addScalar(vec3, 20)).toStrictEqual(new Vector2(22, 23));
});

/* test subtract() static method */
test('subtract two vectors', () => {
    expect(Vector2.subtract(vec1, vec2)).toStrictEqual(new Vector2(-1, -1));
    expect(Vector2.subtract(vec4, vec3)).toStrictEqual(new Vector2(1, 1));
});

/* test subtractScalar() static method */
test('subtract from a vector', () => {
    expect(Vector2.subtractScalar(vec1, 0.5)).toStrictEqual(new Vector2(-0.5, -0.5));
    expect(Vector2.subtractScalar(vec4, 3)).toStrictEqual(new Vector2(0, 1));
});

/* test multiply() static method */
test('multiply two vectors', () => {
    expect(Vector2.multiply(vec1, vec2)).toStrictEqual(new Vector2(0, 0));
    expect(Vector2.multiply(vec3, new Vector2(-1, -2))).toStrictEqual(new Vector2(-2, -6));
});

/* test multiplyScalar() static method */
test('multiply scalar', () => {
    expect(Vector2.multiplyScalar(vec1, 500)).toStrictEqual(new Vector2(0, 0));
    expect(Vector2.multiplyScalar(vec3, 8)).toStrictEqual(new Vector2(16, 24));
});

/* test divide() static method */
test('divide two vectors', () => {
    expect(Vector2.divide(vec1, vec2)).toStrictEqual(new Vector2(0, 0));
    expect(Vector2.divide(vec3, vec4)).toStrictEqual(new Vector2(2/3, 3/4));
});

/* test divideScalar() static method */
test('divide scalar', () => {
    expect(Vector2.divideScalar(vec3, 1)).toStrictEqual(new Vector2(2, 3));
    expect(Vector2.divideScalar(vec4, 2)).toStrictEqual(new Vector2(3/2, 2));
});

/* test dot() static method */
test('dot product of two vectors', () => {
    expect(Vector2.dot(vec1, vec2)).toBe(0);
    expect(Vector2.dot(vec3, vec4)).toBe(18);
});

/* test lerp() static method */
test('linear interpolation of two vectors', () => {
    let vec5:Vector2 = new Vector2(2,5)
    let vec6:Vector2 = new Vector2(6,1)
    let vec7:Vector2 = new Vector2(-6,-1)
    let vec8:Vector2 = new Vector2(2,-4)

    expect(Vector2.lerp(vec5, vec6, 1)).toStrictEqual(new Vector2(2, 5))
    expect(Vector2.lerp(vec5, vec6, 0.4).getX()).toBeCloseTo(4.4)
    expect(Vector2.lerp(vec5, vec6, 0.4).getY()).toBeCloseTo(2.6)
    expect(Vector2.lerp(vec7, vec8, 0.7).getX()).toBeCloseTo(-3.6)
    expect(Vector2.lerp(vec7, vec8, 0.7).getY()).toBeCloseTo(-1.9)
});
