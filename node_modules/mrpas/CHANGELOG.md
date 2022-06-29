# Changelog

## 2.0.0
### Bugfixes
* fixed iterator increment again
* fixed floating point logic in determining initial processed cell per octant row/column
### Modified features
* refactored code for brevity and readability
### New features
* ported to TypeScript
### API break
* exported module is now named. Call `require("mrpas").Mrpas` to import.

## 1.2.1 (2017-02-20)
### Bugfixes
* fixed iterator being incremented twice, causing incorrect FOV shape in ES5 version

## 1.2.0 (2017-02-18)
* Initial release, based on C code available in [libtcod](https://bitbucket.org/libtcod/libtcod).
* Created ES5 and ES6 versions.
