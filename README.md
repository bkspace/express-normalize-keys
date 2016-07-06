### express-normalize-keys

[![npm version](https://badge.fury.io/js/express-normalize-keys.svg)](https://badge.fury.io/js/express-normalize-keys)

Takes an object or array of objects from a request parameter and normalize, recursively all keys. Uses change-case under the hood.

## Usage

```
npm install --save express-normalize-keys

app.use(normalizeKeys.normalize(options))
```

## Development

```
npm i
npm run test
npm run lint
npm run prepublish
```
