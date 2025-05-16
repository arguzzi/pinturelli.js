import { typedParams } from "./_typeValidators.js";

/////////////////////////////
//
export const validateAssets = (assets, nodeId, isRoot) => {
  const origin = isRoot ? "Root" : "Node";
  const scope = isRoot ? "global" : "local";
  typedParams.plainObject(`API pinturelli${origin} (${scope}Assets for "${nodeId}")`, assets);
  for (const asset of Object.values(assets)) {
    const functionAndPath = asset.slice(1, 2);
    typedParams.string(`API pinturelli${origin} (${scope}Assets for "${nodeId}") q5-function-name and file-path (2nd and 3th elements in "${asset[0]}" asset)`, ...functionAndPath);
    if (asset?.[3]) {
      typedParams.function(`API pinturelli${origin} (${scope}Assets for "${nodeId}") success-callback (4th element in "${asset[0]}" asset)`, asset?.[3]);
      if (asset?.[4]) {
        typedParams.function(`API pinturelli${origin} (${scope}Assets for "${nodeId}") error-callback (5th element in "${asset[0]}" asset)`, asset?.[4]);
      }
    }
  }
}

/////////////////////////////
//
export const validatePaintings = (paintings, nodeId) => {
  typedParams.plainObject(`API pinturelliNode (paintings declaration for "${nodeId}") `, paintings);
  typedParams.function(`API pinturelliNode (paintings values for "${nodeId}") `, ...Object.values(paintings));
}

/////////////////////////////
//
export default {
  validateAssets,
  validatePaintings,
}