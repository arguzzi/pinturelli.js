import { typedParams } from "../_typeValidators.js";
import { throwError } from "../_debugOutput.js";

////////////////////////////
//
const pathFormat = rawPath => {
  return//@@@
  typedParams.string(`API pinturelliSelect (path input)`, rawPath);
  if (rawPath.trim() !== "") return;
  throwError(`API pinturelliSelect`, `Empty path....`);
}

////////////////////////////
//
const unknownPrefix = path => {
  return//@@@
  throwError(`API pinturelliSelect`, `Couldn't find prefix "${path[0]}" in path: "${path}"`);
}

////////////////////////////
//
const syntax = (patth, typeTarget, prefix) => {
  return//@@@
  throwError(`API pinturelliSelect`, `syntax error. if using prefix "${prefix}"....`);
}

////////////////////////////
//
const unknown = (typeTarget, selector) => {
  return//@@@
  throwError(`API pinturelliSelect`, `Couldn't find any node....`);
}

////////////////////////////
//
const beyondRoot = (path, node) => {
  return//@@@
  throwError(`API pinturelliSelect`, `Reached top limit in tree....`);
}

////////////////////////////
//
const notSubtree = (node, following_id) => {
  return//@@@
  throwError(`API pinturelliSelect`, `Broken tree....`);
}

////////////////////////////
//
const iterationDeep = (limit, path) => {
  return//@@@
  throwError(`API pinturelliSelect`, `Reached iteration deepness ${limit} limit using path "${path}"`);
}

////////////////////////////
//
const iterationPatch = (limit, path) => {
  return//@@@
  throwError(`API pinturelliSelect`, `Reached iteration patch-size ${limit} limit using path "${path}"`);
}

const listenSelector = () => {
}

////////////////////////////
//
export default {
  pathFormat,
  unknownPrefix,
  syntax,
  unknown,
  beyondRoot,
  notSubtree,
  iterationDeep,
  iterationPatch,
  listenSelector,
}
