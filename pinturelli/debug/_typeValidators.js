import { throwError } from "./_debugOutput.js";

//////////////////////////////
// list of supported types
const supportedTypes = [
  "undefined",
  "boolean",
  "number",
  "string",
  "object",
  "plainObject",
  "array",
  "function"
];

//////////////////////////////
// higher-order function for generic validations (currying)

/**
 * create a function that validates some arguments
 * and returns the true if any of them does not match
 * the expected type, or returns false all arguments are valid
 */
const createAreNot = type => (...args) => {
  if (type === "plainObject") {
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] !== "object" || args[i] === null) return true;
      if (Object.getPrototypeOf(args[i]) !== Object.prototype) return true;
    }
    return false;
  }

  if (type === "array") {
    for (let i = 0; i < args.length; i++) {
      if (!Array.isArray(args[i])) return true;
    }
    return false;
  }

  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] !== type) return true;
  }
  return false;
};

/**
 * create a function that validates some arguments
 * and returns the index of the first one that does not match
 * the expected type, or returns -1 if all arguments are valid
 */
const createAreNotAt = type => (...args) => {
  if (type === "plainObject") {
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] !== "object" || args[i] === null) return i;
      if (Object.getPrototypeOf(args[i]) !== Object.prototype) return i;
    }
    return -1;
  }

  if (type === "array") {
    for (let i = 0; i < args.length; i++) {
      if (!Array.isArray(args[i])) return i;
    }
    return -1;
  }

  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] !== type) return i;
  }
  return -1;
};

/**
 * create a function that validates some arguments
 * and throws an error if any of them is not of the expected type
 */
const createTypedParams = (type, fn_areNotAt) => (origin, ...args) => {
  const invalidIndex = fn_areNotAt(...args);
  if (invalidIndex === -1) return;
  throwError(origin, `This input only accepts values of type ${type}. Invalid parameter at index ${invalidIndex}: "${args[invalidIndex]}"`);
};

//////////////////////////////
// validators for each supported type

/**
 * @example
 * areNot.boolean(arg0, arg1, arg2, etc);
 * // returns true if any argument is non-boolean, and false if not
 */
export const areNot = supportedTypes.reduce((acc, type) => (
  acc[type] = createAreNot(type)
), {});

/**
 * @example
 * areNotAt.boolean(arg0, arg1, arg2, etc);
 * // returns the index of the first argument that is not a boolean,
 * // or -1 if all arguments are booleans.
 */
export const areNotAt = supportedTypes.reduce((acc, type) => (
  acc[type] = createAreNotAt(type)
), {});

/**
 * @example
 * typedParams.boolean(origin, arg0, arg1, arg2, etc);
 * // validates each argument in order. if all are booleans, it does nothing.
 * // otherwise, throws an error immediately for the first non-boolean value,
 * // specifying the "origin" of the call and the exact invalid argument.
 */
export const typedParams = supportedTypes.reduce((acc, type) => (
  acc[type] = createTypedParams(type, areNotAt[type])
), {});

//////////////////////////////
//
export default {
  areNot,
  areNotAt,
  typedParams,
};
