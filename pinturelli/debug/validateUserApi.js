import { areNot, areNotAt, typedParams } from "./validateTypes.js";
import { throwError } from "./debuggerOutput.js";

//////////////////////////////
//
function node(selector) {
}

//////////////////////////////
//
function nodes(selector) {
}

//////////////////////////////
//
function newNode(GLOBAL, selector, seed) {
}

//////////////////////////////
//
function add(node, Base) {
  if (!(node instanceof Base)) {
    throwError(`User api`, `Only instances of subclasses of "${Base.name}" can be nested`);
  }
}

//////////////////////////////
//
function doWhen(GLOBAL, publisherId, eventName, callbacks) {
}

//////////////////////////////
//
function propagate(resolution, options) {
}

//////////////////////////////
//
function propagatePostOrder(resolution, options) {
}

//////////////////////////////
//
function bubble(resolution, options) {
}

//////////////////////////////
//
function bubbleReverse(resolution, options) {
}

//////////////////////////////
//
function animate() {
}

//////////////////////////////
//
function animateLoop() {
}

//////////////////////////////
//
function configParams(resolution, options) {
}

//////////////////////////////
//
export default {
  node,
  nodes,
  add,
  doWhen,
  propagate,
  propagatePostOrder,
  bubble,
  bubbleReverse,
  animate,
  animateLoop,
  configParams,
  typedParams,
}