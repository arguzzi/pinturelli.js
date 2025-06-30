import BLOCK from "./_00_block.js";
import TAP from "./_01_tap.js";
import HOLD from "./_02_hold.js";
import DRAG from "./_03_drag.js";
import SCROLL from "./_04_scroll.js";
import SWIPE from "./_05_swipe.js";
import THROW from "./_06_throw.js";
import MULTI_TAP from "./_07_multi_tap.js";
import MULTI_HOLD from "./_08_multi_hold.js";
import MULTI_TRANSFORM_PAN from "./_09_multi_transform_pan.js";
import MULTI_TRANSFORM_ZOOM from "./_10_multi_transform_zoom.js";
import MULTI_TRANSFORM_ROTATION from "./_11_multi_transform_rotation.js";
import MULTI_TRANSFORM_ALL from "./_12_multi_transform_all.js";
import MULTI_SWIPE from "./_13_multi_swipe.js";

const allGestures = {
  BLOCK,
  TAP,
  HOLD,
  DRAG,
  SCROLL,
  SWIPE,
  THROW,
  MULTI_TAP,
  MULTI_HOLD,
  MULTI_TRANSFORM_PAN,
  MULTI_TRANSFORM_ZOOM,
  MULTI_TRANSFORM_ROTATION,
  MULTI_TRANSFORM_ALL,
  MULTI_SWIPE,
}

export default {
  get: key => allGestures[key.slice(1)]
}