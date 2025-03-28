export default {
  areNot,
  typedParams,
};

//////////////////////////////
// list of supported types
const supportedTypes = ["boolean", "number", "string", "object", "function"];

//////////////////////////////
// higher-order function for generic validations (currying)

/**
 * returns a function that checks arguments and returns the index
 * of the first argument that does not match the expected type,
 * or -1 if all arguments are valid.
 */
const createTypeValidator = (type) => (...args) => {
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] !== type) return i;
  }
  return -1;
};

/**
 * returns a function that validates arguments and throws an error
 * if any argument is not of the expected type
 */
const createParamsValidator = (type, validator) => (...args) => {
  const invalidIndex = validator(...args);
  if (invalidIndex !== -1) {
    throw new Error(
      `Invalid parameter: "${args[invalidIndex]}". This method only receives ${type} typed values.`
    );
  }
};

//////////////////////////////
// create validators for each supported type

/**
 * @example
 * areNot.boolean(arg0, arg1, arg2, etc);
 * // returns the index of the first argument that is not a boolean,
 * // or -1 if all arguments are booleans.
 */
const areNot = supportedTypes.reduce((acc, type) => ({
  ...acc,
  [type]: createTypeValidator(type),
}), {});

/**
 * @example
 * typedParams.boolean(arg0, arg1, arg2, etc);
 * // throws an error for the first argument that is not a boolean.
 * // if all arguments are booleans, it does nothing.
 */
const typedParams = supportedTypes.reduce((acc, type) => ({
  ...acc,
  [type]: createParamsValidator(type, areNot[type]),
}), {});
