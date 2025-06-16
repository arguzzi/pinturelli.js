import { throwError } from "./_debugOutput.js";

//////////////////////////////
//
// list of supported types
const supportedTypes = Object.freeze([
  "undefined",
  "boolean",
  "number", // not infinite or nan
  "string",
  "symbol",
  "null", // is null
  "object", // not null
  "plainObject", // not null and prototype = object
  "array", // is array
  "map", // instance of map
  "set", // instance of set
  "promise", // instance of promise
  "function",
]);

//////////////////////////////
// 
const specialValidator = (() => {
  const validators = {
    number: arg => (
      typeof arg === "number" &&
      Number.isFinite(arg)
    ),
    null: arg => arg === null,
    object: arg => (
      typeof arg === 'object' &&
      arg !== null
    ),
    plainObject: arg => (
      typeof arg === "object" &&
      arg !== null &&
      Object.getPrototypeOf(arg) === Object.prototype
    ),
    array: Array.isArray,
    map: arg => arg instanceof Map,
    set: arg => arg instanceof Set,
    promise: arg => arg instanceof Promise,
  }

  return Object.entries(validators).reduce((acc, [type, validator]) => {
    acc[type] = (...args) => args.findIndex(arg => !validator(arg));
    return acc;
  }, {});
})();

//////////////////////////////
//
const createAreNotAt = targetType => (...args) => {
  const isSpecial = Object.hasOwn(specialValidator, targetType);
  if (isSpecial) return specialValidator[targetType](...args);
  return args.findIndex(arg => typeof arg !== targetType);
}

/**
 * @example
 * areNotAt.boolean(arg0, arg1, arg2, etc);
 * // returns the index of the first argument that is not a boolean,
 * // or -1 if all arguments are booleans.
 */
export const areNotAt = supportedTypes.reduce((acc, targetType) => {
  acc[targetType] = createAreNotAt(targetType);
  return acc;
}, {});

/**
 * @example
 * areNot.boolean(arg0, arg1, arg2, etc);
 * // returns true if any argument is non-boolean, and false if not
 */
export const areNot = supportedTypes.reduce((acc, targetType) => {
  acc[targetType] = (...args) => areNotAt[targetType](...args) === -1;
  return acc;
}, {});

//////////////////////////////
//
const createTypedParams = targetType => (origin, ...args) => {
  const invalidIndex = areNotAt[targetType](...args);
  if (invalidIndex === -1) return;
  throwError(origin, `This input only accepts values of type: "${targetType}". Invalid parameter at index ${invalidIndex}: "${args[invalidIndex]}"`);
}

/**
 * @example
 * typedParams.boolean(origin, arg0, arg1, arg2, etc);
 * // validates each argument in order. if all are booleans, it does nothing.
 * // otherwise, throws an error immediately for the first non-boolean value,
 * // specifying the "origin" of the call and the exact invalid argument.
 */
export const typedParams = supportedTypes.reduce((acc, targetType) => {
  acc[targetType] = createTypedParams(targetType);
  return acc;
}, {});

//////////////////////////////
//
export default {
  areNot,
  areNotAt,
  typedParams,
}
