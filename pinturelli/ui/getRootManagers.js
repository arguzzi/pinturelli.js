import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/state.js";

const trunc = Math.trunc;
const safeDivide = (a, b) => b === 0 ? 0 : a / b;
const truncDivide = (a, b) => trunc(safeDivide(a, b));

//////////////////////////////
//
const getRootSize = ({ resolutionX, resolutionY, proportion }) => {
  if (flag.err) apiErrors.sizeParams(resolutionX, resolutionY, proportion);
  const hasWidth = resolutionX !== null;
  const hasHeight = resolutionY !== null;
  const fixed = hasWidth && hasHeight;
  const WIDTH = hasWidth ? resolutionX : trunc(resolutionY * proportion);
  const HEIGHT = hasHeight ? resolutionY : truncDivide(resolutionX, proportion);
  const PROPORTION = fixed ? truncDivide(resolutionX, resolutionY) : proportion;
  return { WIDTH, HEIGHT, PROPORTION };
}

//////////////////////////////
//
export default (description) => {

  return {
    getRootSize,
  }
}
