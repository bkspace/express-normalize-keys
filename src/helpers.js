export const determine = {
  isObject: (input) => {
    return input === Object(input)
  },
  isArray: (input) => {
    return Array.isArray(input)
  },
  isDate: (input) => {
    return typeof input.getMonth === 'function'
  },
  isRegExp: (input) => {
    return typeof input.test === 'function'
  },
  isBoolean: (input) => {
    return typeof input === 'boolean'
  },
  isFunction: (input) => {
    return typeof input === 'function'
  }
}
