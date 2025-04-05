import { throwError } from "./debuggerOutput.js";

//////////////////////////////
// list of supported types
const supportedTypes = ["undefined", "boolean", "number", "string", "object", "function"];

//////////////////////////////
// higher-order function for generic validations (currying)

/**
 * returns a function that checks arguments and returns 
 * true if all arguments matches the expected type, or false if not
 */
const createTypeValidator = (type) => (...args) => {
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] !== type) return true;
  }
  return false;
};

/**
 * returns a function that checks arguments and returns the index
 * of the first argument that does not match the expected type,
 * or -1 if all arguments are valid.
 */
const createTypeValidatorAt = (type) => (...args) => {
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] !== type) return i;
  }
  return -1;
};

/**
 * returns a function that validates arguments and throws an error
 * if any argument is not of the expected type
 */
const createParamsValidator = (type, validatorAt) => (origin, ...args) => {
  const invalidIndex = validatorAt(...args);
  if (invalidIndex !== -1) {
      throwError(origin, `This method only receives ${type} typed values. Invalid parameter at index: ${invalidIndex} = "${args[invalidIndex]}"`
    );
  }
};

//////////////////////////////
// create validators for each supported type

/**
 * @example
 * areNot.number(arg0, arg1, arg2, etc);
 * // returns true if all argumantes are number, and false if not
 */
export const areNot = supportedTypes.reduce((acc, type) => ({
  [type]: createTypeValidator(type),
  ...acc,
}), {});

/**
 * @example
 * areNotAt.boolean(arg0, arg1, arg2, etc);
 * // returns the index of the first argument that is not a boolean,
 * // or -1 if all arguments are booleans.
 */
export const areNotAt = supportedTypes.reduce((acc, type) => ({
  [type]: createTypeValidatorAt(type),
  ...acc,
}), {});

/**
 * @example
 * typedParams.string(arg0, arg1, arg2, etc);
 * // throws an error for the first argument that is not a string.
 * // if all arguments are booleans, it does nothing.
 */
export const typedParams = supportedTypes.reduce((acc, type) => ({
  [type]: createParamsValidator(type, areNotAt[type]),
  ...acc,
}), {});

//////////////////////////////
//
export default {
  areNot,
  areNotAt,
  typedParams,
};