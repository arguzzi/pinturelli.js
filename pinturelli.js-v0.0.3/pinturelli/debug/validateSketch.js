import { areNot } from "./validateTypes.js";
import { throwError } from "./debuggerOutput.js";

//////////////////////////////
//
// reminder:
// node.ASSETS = {source: [load, callback], source: [load, callback], ...}

function checkInitialAssets({ ALL_NODES }) {
  for (const [nodeId, node] of ALL_NODES) {

    if (areNot.object(node, node.ASSETS)) {
      throwError(`Sketch`, `Couldn't load node "${nodeId}". Input property "ASSETS" must be an object`);
    }

    // if no assets, skip this node
    if (Object.keys(node.ASSETS).length === 0) continue;

    // node.ASSETS[source] = [load, callback]
    Object.keys(node.ASSETS).forEach(source => {

      if (areNot.string(source)) {
        throwError(`Sketch`, `Couldn't load node "${nodeId}". The input source of each asset must be string. Invalid: ${source}`);
      }
      
      if (!Array.isArray(node.ASSETS[source])) {
        throwError(`Sketch`, `Couldn't load node "${nodeId}". Each input asset must be an array (with load function and callback)`);
      }

      if (areNot.function(node.ASSETS[source][0])){
        throwError(`Sketch`, `Couldn't load node "${nodeId}". First element of each input asset must be a function. Invalid: ${node.ASSETS[source][0]}`);
      }

      if (
        areNot.function(node.ASSETS[source][1]) ||
        areNot.undefined(node.ASSETS[source][1])
      ) {
        throwError(`Sketch`, `Couldn't load node "${nodeId}". If specified, second element of each input asset must be a function. Invalid: ${node.ASSETS[source][1]}`);
      }
    });
  }
}

//////////////////////////////
//
// reminder:
// finalAssets = {source: Object_loaded, source: Object_loaded, ...}
function checkFinalAssets({ ALL_NODES }) {
  for (const [nodeId, node] of ALL_NODES) {

    if (areNot.object(node, node.ASSETS)) {
      throwError(`Sketch`, `Couldn't load node "${nodeId}". Output property "ASSETS" must be an object`);
    }

    // if no assets, skip this node
    if (Object.keys(node.ASSETS).length === 0) continue;

    // node.ASSETS[source] = Object_loaded
    Object.keys(node.ASSETS).forEach(source => {

      if (areNot.string(source)) {
        throwError(`Sketch`, `Couldn't load node "${nodeId}". The output source of each asset must be string. Invalid: ${source}`);
      }
      
      if (areNot.object(node.ASSETS[source])) {
        throwError(`Sketch`, `Couldn't load node "${nodeId}". Each output asset must be an object (if not, check source to be matching the file)`);
      }
    });
  }
}

export default {
  checkInitialAssets,
  checkFinalAssets,
}
