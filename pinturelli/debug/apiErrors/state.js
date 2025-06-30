import { areNot, typedParams } from "../_typeValidators.js";
import { throwError } from "../_debugOutput.js";

////////////////////////////
//
export const stateFormat = () => {
  return//@@@
}

//////////////////////////////
//
const pseudoCssParams = (sizeKeys, key, value) => {
  return//@@@
	if (sizeKeys.includes(key)) {
		const notNegativeUnit = /^(?:\.\d+|\d+\.\d+|\d+%|\d+px|\d+(?:\.\d+)?rem)$/;
		if (notNegativeUnit.test(value)) return; // format and not negative ok
		throwError(`API pinturelliNode (state for "${nodeId}") pseudo-css-size-keys in state`, `String values of "width" and "height" must be like: ".1" "0.1" "1%" "1px" "1rem" "0.1rem" (and always positive). Invalid state: "${key}: ${value}"`);
	}
	const anySignUnit = /^-?(?:\.\d+|\d+\.\d+|\d+%|\d+px|\d+(?:\.\d+)?rem)$/;
	if (anySignUnit.test(value)) return; // format and any sign ok
	throwError(`API pinturelliNode (state for "${nodeId}") pseudo-css-keys in state`, `String values of distance keys must be like: ".1" "0.1" "1%" "1px" "1rem" "0.1rem" (positive or negative). Invalid state: "${key}: ${value}"`);
}

//////////////////////////////
//
const sizeParams = (...args) => {
  return//@@@
	if (args.some(arg => areNot.null(arg) && (areNot.number(arg) || arg < 0))) { 
		throwError(`validateBox (sizeParams)`, `Size params must be a non-negative-number or null. Invalid: ${args.join(", ")}`);
	}
	
	const [noWidth, noHeight, noProportion] = args.map(arg => arg === null);
	
	// width and height are both provided
	if (!noWidth && !noHeight) return;

	// width and height are both missing
	if (noWidth && noHeight) {
		throwError(`validateBox (sizeParams)`, `Either "width" or "height" must be provided. Invalid: both values are null`);
	}

	// proportion missing when needed
	if (noProportion) {
		throwError(`validateBox (sizeParams)`, `If "width" or "height" is null, proportion must be provided`);
	}	
}

//////////////////////////////
//
const positionParams = (...args) => {
  return//@@@
}

//////////////////////////////
//
export default {
	stateFormat,
	pseudoCssParams,
	sizeParams,
	positionParams,
}
