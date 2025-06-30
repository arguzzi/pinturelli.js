import flag from "../debug/_allModesFlags.js";
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

export default (dependencies) => {
  const { SKETCH, EMITTER } = dependencies;
  const container = SKETCH._pinturelli.container;
  
  //____________
  // gestures inputs
  const gesturesHandler = (_e) => EMITTER.gesturesInput(_e);
  container.addEventListener("pointerdown", gesturesHandler);
  container.addEventListener("pointermove", gesturesHandler);
  container.addEventListener("pointercancel", gesturesHandler);
  container.addEventListener("pointerup", gesturesHandler);
  
  //____________
  // context inputs
  const contextHandler = (_e) => EMITTER.contextInput(_e);
	window.addEventListener("fullscreenchange", contextHandler);
  const vvpt = !!window?.visualViewport;
  if (vvpt) window.visualViewport.addEventListener("resize", contextHandler);
	else window.addEventListener("resize", contextHandler);

  //____________
  // prevention: multiple touch gestures
	container.addEventListener("touchstart", (_e) => {
		if (_e.touches.length > 1) _e.preventDefault(); 
	}, { passive: false });

  //____________
  // prevention: gesture for "back" or "reload"
	container.addEventListener("touchmove", (_e) => {
		_e.preventDefault();
	}, { passive: false });

  //____________
  // prevention: gesture for zoom
	container.addEventListener("gesturestart", (_e) => {
		_e.preventDefault();
	}, { passive: false });

  //____________
  // prevention: disable double-tap to zoom
	container.style.touchAction = "manipulation";

  //____________
  // prevention: disable long touch to select text
	container.style.userSelect = "none";
}