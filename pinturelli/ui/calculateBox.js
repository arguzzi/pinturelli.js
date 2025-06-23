import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/state.js";

//////////////////////////////
//
export const getRootSize = ({ resolutionX, resolutionY, proportion }) => {
	if (flag.err) apiErrors.sizeParams(resolutionX, resolutionY, proportion);
	const hasWidth = resolutionX !== null;
	const hasHeight = resolutionY !== null;
  const WIDTH = hasWidth
      ? resolutionX
      : proportion * resolutionY;
  const HEIGHT = hasHeight
      ? resolutionY
      : (proportion === 0 ? 0 : resolutionX / proportion);
  const PROPORTION = hasWidth && hasHeight
      ? resolutionX / resolutionY
      : proportion;
  return { WIDTH, HEIGHT, PROPORTION };
}

//////////////////////////////
//
const sizeKeys = ["width", "height"];
const distanceKeys = ["left", "right", "top", "bottom", "offsetX", "offsetY"];
const horizontalKeys = ["width", "left", "right", "offsetX"];
const pseudoCssKeys = [ ...sizeKeys, ...distanceKeys ];

const getNumber = (input, suffix) => Number(input.slice(0, suffix * -1));
const parser = {
	ratio: (reference, input) => reference * getNumber(input, 0),
	percent: (reference, input) => reference * getNumber(input, 1) / 100,
	px: (pointsInPx, input) => pointsInPx * getNumber(input, 2),
	rem: (pointsInPx, rem, input) => pointsInPx * rem * getNumber(input, 3),
}

export const calculatePseudoCss = (canvas, followedBox, state) => {
	const pointsInPx = q5.width / canvas.clientWidth;
	const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
	const newState = Object.entries(state).reduce((acc, [key, value]) => {
		if (typeof value !== "string" || !pseudoCssKeys.includes(key)) {
			acc[key] = value;
			return acc;
		}

		if (flag.err) apiErrors.pseudoCssParams(sizeKeys, key, value);
		if (value.endsWith("rem")) acc[key] = parser.rem(pointsInPx, rem, value);
		else if (value.endsWith("px")) acc[key] = parser.px(pointsInPx, value);
		else {
			const isHorizontal = horizontalKeys.includes(key);
			const reference = isHorizontal ? followedBox.width : followedBox.height;
			if (value.endsWith("%")) acc[key] = parser.percent(reference, value);
			else acc[key] = parser.ratio(reference, value);
		}
		return acc;
	}, {});

	return { ...state, ...newState };
}

//////////////////////////////
//
export const calculatePosition = () => {
	
}

//////////////////////////////
//
export default {
	pseudoCss : calculatePseudoCss,
	size: calculateSize,
	position: calculatePosition,
}
