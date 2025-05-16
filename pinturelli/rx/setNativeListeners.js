import flag from "../debug/_errorAndLogFlags.js";
import { genericLogger } from "../debug/_debugOutput.js";

//////////////////////////////
//
// primary listeners for native user interaction
//
// pointer events (to emitter):
// -> pointerdown, pointerup, pointermove, pointercancel
//
// context events (to emitter):
// -> resize, fullscreenchange
//
// gesture preventions:
// -> back, reload, zoom, double-tap, select text
//
//////////////////////////////

export default function setNativeListeners(EMITTER) {
  
  //____________
  // gestures inputs
  const gesturesHandler = (_e) => EMITTER.gesturesInput(_e);
  document.addEventListener("pointerdown", gesturesHandler);
  document.addEventListener("pointermove", gesturesHandler);
  document.addEventListener("pointercancel", gesturesHandler);
  document.addEventListener("pointerup", gesturesHandler);
  
  //____________
  // context inputs
  const contextHandler = (_e) => EMITTER.contextInput(_e);
	document.addEventListener("fullscreenchange", contextHandler);
  const vvpt = !!window?.visualViewport;
  if (vvpt) window.visualViewport.addEventListener("resize", contextHandler);
	else window.addEventListener("resize", contextHandler);

  //____________
  // navigation inputs
  // const navigationHandler = (_e) => EMITTER.navigationInput(_e);
  // window.addEventListener("popstate", navigationHandler);
  // window.addEventListener("hashchange", navigationHandler);
  // window.addEventListener("beforeunload", navigationHandler);

  //____________
  // prevention: multiple touch gestures
	document.addEventListener("touchstart", (_e) => {
		if (_e.touches.length > 1) _e.preventDefault(); 
	}, { passive: false });

  //____________
  // prevention: gesture for "back" or "reload"
	document.addEventListener("touchmove", (_e) => {
		_e.preventDefault();
	}, { passive: false });

  //____________
  // prevention: gesture for zoom
	document.addEventListener("gesturestart", (_e) => {
		_e.preventDefault();
	}, { passive: false });

  //____________
  // prevention: disable double-tap to zoom
	document.body.style.touchAction = "manipulation";

  //____________
  // prevention: disable long touch to select text
	document.body.style.userSelect = "none";

  //____________
  if (flag.log) genericLogger(`__`, `Native events added`);
}