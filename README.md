# babel-plugin-auto-numeral
[![Actions Status][action-img]][action-url]
[![Code coverage][cov-img]][cov-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

## Why?
1. Solving IEE754 by numeral usually takes 3 times of code, this plugin can resolve `+-*/` automatically.
2. Simulated human computing

## Require
babel7

## Install from npm
```bash
npm i -D babel-plugin-auto-numeral
```

## Usage
1\. add babel plugin:
```json
{
    "plugins": [
        ["babel-plugin-auto-numeral",{"precision": 2,"numeralName": "numeral"}]
    ]
}
```
2\. import numeral and use it
```js
import numeral from 'numeral'; // require numeralName first
const a = 1;
console.log(numeral(a + 0.7 * 0.7)); // 1.49
```

### options

key | type | description 
:--- | :--- | :---
precision | number/null/undefined | to pretend human calculate, this option will fix precision after every step
numeralName | string | transform the function named with the numeralName


[action-img]: https://github.com/hanzhangyu/babel-plugin-auto-numeral/workflows/ci/badge.svg
[action-url]: https://github.com/hanzhangyu/babel-plugin-auto-numeral/actions
[cov-img]: https://img.shields.io/coveralls/hanzhangyu/babel-plugin-auto-numeral.svg?style=flat-square
[cov-url]: https://coveralls.io/github/hanzhangyu/babel-plugin-auto-numeral?branch=master
[dep-img]: https://img.shields.io/david/hanzhangyu/babel-plugin-auto-numeral.svg?style=flat-square
[dep-url]: https://david-dm.org/hanzhangyu/babel-plugin-auto-numeral
[dev-dep-img]: https://img.shields.io/david/dev/hanzhangyu/babel-plugin-auto-numeral.svg?style=flat-square
[dev-dep-url]: https://david-dm.org/hanzhangyu/babel-plugin-auto-numeral#info=devDependencies
[npm-ver-img]: https://img.shields.io/npm/v/babel-plugin-auto-numeral.svg?style=flat-square
[npm-dl-img]: https://img.shields.io/npm/dm/babel-plugin-auto-numeral.svg?style=flat-square
[npm-lc-img]: https://img.shields.io/npm/l/babel-plugin-auto-numeral.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/babel-plugin-auto-numeral
