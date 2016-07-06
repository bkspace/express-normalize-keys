import changeCase from 'change-case'
import { determine } from './helpers'

const internals = { changeCase }

/**
 * Applys a convert function to a passed in Object or Array.
 *
 * A recursive function that can handle nested Objects, nested Arrays or a mixture
 *  of both.
 *
 * Recursive base-case is where an input is not an Object or Array.
 *
 * @param {Object|Array|primitive} input - the value to apply the convert function to
 * @param {Function|String} convert - a function, or name of function to call on each key
 * @returns {Object|Array|primitive} input - another object or array to applyToKeys
 */
internals._applyToKeys = (input, convert) => {
  const { isObject, isArray, isDate, isBoolean, isRegExp } = determine

  if (!isObject(input) || isDate(input) || isBoolean(input) || isRegExp(input)) {
    return input // handle recursive base case
  }

  return isArray(input)
    ? internals._applyOnArray(input, convert)
    : internals._applyOnObject(input, convert)
}

/**
 * Applys a convert function to a passed in Object.
 *
 * A non-destructive function that returns a normalized Object. Used in the recursive
 *  '_applyToKeys' to handle Object inputs.
 *
 * @param {Object} input - the Object to apply the convert function to
 * @param {Function|String} convert - a function, or name of function to call on each key
 * @returns {Object} normalized - a normalized version of input
 */
internals._applyOnObject = (input, convert) => {
  let normalized = {}
  // for (let [key, value] of Object.entries(input)) {
  //   normalized[internals._convertKey(key, convert)] = internals._applyToKeys(value, convert)
  // }
  Object.keys(input).forEach((key) => {
    normalized[internals._convertKey(key, convert)] = internals._applyToKeys(input[key], convert)
  })

  return normalized
}

/**
 * Applys a convert function to a passed in Array.
 *
 * A non-destructive function that returns a normalized Array. Used in the recursive
 *  '_applyToKeys' to handle Array inputs.
 *
 * @param {Array} input - the Object to apply the convert function to
 * @param {Function|String} convert - a function, or name of function to call on each key
 * @returns {Array} normalized - a normalized version of input
 */
internals._applyOnArray = (input, convert) => {
  let normalized = []
  input.forEach((object) => {
    normalized.push(internals._applyToKeys(object, convert))
  })
  return normalized
}

/**
 * Does the actual string conversion of an Object key.
 *
 * Handles convert being a function or function name. If a string is passed and it doesn't
 *  correspond to a function on the changeCase library, just return the key, un-converted.
 *
 * @param {String} key - the String to convert
 * @param {Function|String} convert - a function, or name of function to call on each key
 * @returns {String} newKey - the converted string
 */
internals._convertKey = (key, convert) => {
  return determine.isFunction(convert)
    ? convert(key)
    : changeCase[convert]
      ? changeCase[convert](key)
      : key
}

/**
 * Takes an object or Arrray from the request object and recursively
 *  normalizes it's keys.
 *
 * example options:
 *  {
 *    target: 'query',
 *    name: 'newQuery'
 *    convert: (key) => key + '!',
 *  }
 *
 * example usage:
 *  app.use(normalize(options))
 *  app.get('/', normalize(options), (req, res) => {})
 *
 *
 * @param {Object} options - an Object of options
 * @param {String*} options.target - the property on the req to target
 * @param {String*} options.name - the property on the req to put the normalized Object
 * @param {String|Function} options.convert - the function or name of function to call on each key
 * @returns {Function} - an express middleware function
 */
internals.normalize = (options) => {
  options = options || {}
  options.target = options.target || 'query'
  options.convert = options.convert || 'camel'
  options.name = options.name || options.target

  return (req, res, next) => {
    req[options.target] = req[options.target] || {}
    req[options.name] =
      internals._applyToKeys(req[options.target], options.convert)
    next()
  }
}

export default internals
