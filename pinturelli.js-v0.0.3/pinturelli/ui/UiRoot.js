import userDbgr from "../debug/validateUserApi.js"
import UiCore from "./UiCore.js";

export default class UiRoot extends UiCore {

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL) {
    const { INSTANCE, CONFIG } = GLOBAL;

    const LOCAL = {parent,
      parent: "ARGUZZI",
      id: CONFIG.ROOT_PROTO_ID + INSTANCE,
      localPosX: 0, 
      localPosY: 0, 
      localWidth: GLOBAL.CONFIG.CANVAS.resolutionX, 
      localHeight: GLOBAL.CONFIG.CANVAS.resolutionY, 
      depthLevel: -1,
      isVisible: true,
    }
    
    super(GLOBAL, LOCAL);
    GLOBAL.ALL_NODES.set(LOCAL.id, this);
  }

  //____________
  // node <> USER API
  node(selector) {
    if (this.DEBUG) userDbgr.node(selector);
    return this.GLOBAL.ALL_NODES.get(selector);
  }

  //____________
  // nodes <> USER API
  nodes(selector) {
    if (this.DEBUG) userDbgr.nodes(selector);
    return this.GLOBAL.ALL_NODES.get(selector);
  }

  //____________
  // newNode <> USER API
  newNode(selector, seed) {
    if (this.DEBUG) userDbgr.newNode(this.GLOBAL, selector, seed);
    const parent = this.node(selector);
    return parent.add(seed);
  }

  //____________
  // _updatePosition() {
  //   if (this.DEBUG) dbgr.emptyMethod();
  // }

  // _createScreenshot(initial = true) {
  //   if (this.DEBUG) dbgr.emptyMethod();
  // }
}
