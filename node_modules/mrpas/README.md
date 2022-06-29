# MRPAS

## Installation

Just use npm:

```
npm install mrpas
```

Or grab the code from the [repository](https://bitbucket.org/umbraprojekt/mrpas) and include it in your project.

## Usage

### Instantiation

Instantiate a `Mrpas` object by passing it the map dimensions and a callback for determining map cell transparency:

```
const Mrpas = require("mrpas").Mrpas;

const fov = new Mrpas(20, 20, (x, y) => map[x][y].transparent);
```

### Compute FOV

Compute the field of view for any set of coordinates by calling the `Mrpas#compute()` method and passing it the origin coordinates, FOV calculation radius and two callbacks: one for determining whether a call has been marked as visible, and the othe for marking it as visible:

```
fov.compute(
    10,
    10,
    7,
    (x, y) => map[x][y].visible,
    (x, y) => map[x][y].visible = true
);
```

To calculate the FOV on the entire map, regardless of radius, you may pass `Infinity` as the radius value. Just remember that the transparency callback (the one passed to the constructor) will need to account for this, returning `false` when a cell outside the map is checked.

### Map dimension changing

Should your map change dimensions, you can inform `Mrpas` about it by calling `Mrpas#setMapDimensions()`:

```
fov.setMapDimensions(40, 40);
```

### TypeScript

MRPAS includes a TypeScript declaration file. It can be used in TypeScript projects without additional typings:

```
import { Mrpas } from "mrpas";

const fov: Mrpas = new Mrpas(20, 20, (x: number, y: number): boolean => map[x][y].transparent);

fov.compute(
    10,
    10,
    7,
    (x: number, y: number): boolean => map[x][y].visible,
    (x: number, y: number): void => map[x][y].visible = true
);
```

## About MRPAS

MRPAS, or [Mingos' Restrictive Precise Angle Shadowcasting](http://www.roguebasin.com/index.php?title=Restrictive_Precise_Angle_Shadowcasting) (Precise Angle Shadowcasting for short) is a field of view (FOV) computation algorithm. Given a 2D grid with a source point *S* and *n* points marked as obstacles, it will determine all points visible from *S*.

To visualise this, let the following be a 2D grid of 20 by 20 points. The character `@` represents the field of view source, `#` characters represent obstacles. Cells with yellow background are in the source point's field of view:

![fov](https://mingos.bitbucket.io/img/umbraprojekt/mrpas/fov.png)

### Real life uses

This algorithm was conceived in the year 2008 for the purpose of being used in a [roguelike](http://www.roguebasin.com/index.php?title=What_a_roguelike_is) game. To this day, roguelikes remain the focus of MRPAS.

The algorithm was originally written in C and was included in the roguelike library [libtcod](https://bitbucket.org/libtcod/libtcod). It also contained a C++ wrapper.

Since 2008, MRPAS has been implemented [in various languages](http://www.roguebasin.com/index.php?title=Restrictive_Precise_Angle_Shadowcasting#Implementations), and has been successfully used in numerous roguelike games.

### Restrictiveness vs. permissiveness

The name itself relates to other FOV algorithms, some of which are considered to be permissive, e.g. [Permissive FOV](http://www.roguebasin.com/index.php?title=Permissive_Field_of_View). The "permissiveness" means that many more points are considered to be in FOV than one would consider "natural".

MRPAS is in that regard restrictive: it allows far less points into the FOV, resulting in a more natural-looking shape of the field of view.

### Symmetry

A FOV algorithm is considered symmetric given that the following is true:

>**Given** any set of points A and B, **when** B is in FOV of A, **then** A is in FOV of B.

In other words, a field of view is symmetric when all of the points seen from source can also see the source, while all the points not seen by the source, cannot see the source either.

MRPAS is **asymmetric**.

Considering the mathematics behind determining the FOV, the line of sight from A to B will be computed differently than from B to A. This results in symmetry artifacts, e.g. points A and B where only one can see the other.

The algorithm's asymmetry can be seen on the following image, where the `.` character has been used to mark asymmetric points (if on yellow background, they can be seen from the source, but cannot see the source; if on black, the source is visible from them, but it cannot see them):

![fov](https://mingos.bitbucket.io/img/umbraprojekt/mrpas/symmetry.png)

On the above map, 1.6% of all points not containing an obstacle are asymmetric.

The percentage of asymmetric points is within the range of single digit numbers, depending on the map layout. An "outdoor" map with scattered single point obstacles will always contain the most symmetry artifacts.

For comparison, here's an "outdoor" map with 3.9% asymmetric points:

![fov](https://mingos.bitbucket.io/img/umbraprojekt/mrpas/symmetry-outdoor.png)

### Performance

MRPAS was written with performace in mind. It processes as few points as possible, discarding the ones obviously out of FOV. Since raw numbers, such as FOV computations per second, are meaningless without context, suffice it to say that MRPAS tends to match or outperform all popular FOV algorithms.

## Images

FOV images have been generated by [FOV Torture Chamber](https://bitbucket.org/umbraprojekt/fov-torture-chamber).
