import { typedParams } from "../_typeValidators.js";
import { throwError } from "../_debugOutput.js";

import { stateFormat } from "./state.js";
import { assetsFormat, paintingsFormat } from "./loads.js";

import UiClasses from "../../ui/UiClasses.js";
import UiGestures from "../../ui/UiGestures.js";

////////////////////////////
//
const rootDescription = (allRoots, description) => {
	const { rootId, globalAssets, sketchSetup } = description;

  // root id
  typedParams.string(`API pinturelliRoot (customRootId)`, rootId);
  if (!/^_[A-Za-z][A-Za-z0-9_-]*$/.test(rootId)) {
    throwError(`API pinturelliRoot (customRootId)`, `The value of "customRootId" must start with "_", then a letter. Subsequent characters, if any, must be letters, digits, hyphens (-) or underscores (_). Invalid id: "${rootId}"`);
  }
  if (allRoots.has(rootId)) {
    throwError(`API pinturelliRoot (customRootId)`, `The id "${rootId}" is already in use.`);
  }
  
  // info
  typedParams.plainObject(`API pinturelliRoot (description of "${rootId}")`, description);
  const descriptionKeys = Object.keys(description);
	const nullableKeys = ["customRootId", "resolutionX", "resolutionY", "proportion"];
  const typeTargetsMap = new Map([
    ["boolean", ["q5WebGpuMode", "q5PixelatedMode", "q5NoAlphaMode"]],
    ["number", ["resolutionX", "resolutionY", "proportion"]],
    ["string", ["customRootId", "debugSelector"]],
  ]);
  for (const [typeTarget, targets] of typeTargetsMap) {
    const typedKeys = descriptionKeys.reduce((acc, key) => {
      if (targets.includes(key)) acc.push(key);
      return acc;
    }, []);
    if (typedKeys.length === 0) continue;
		const notNullableKeys = typedKeys.filter(k => !nullableKeys.includes(k));
		const a = notNullableKeys.map(k => description[k]);
    typedParams[typeTarget](`API pinturelliRoot (description for "${rootId}")`, ...a);
  }
  
  // assets
  assetsFormat(globalAssets, rootId, true);

  // setup
  typedParams.array(`API pinturelliRoot (sketchSetup)`, sketchSetup, ...sketchSetup);
  for (let i = 0; i < sketchSetup.length; i++) {
    const command = sketchSetup[i];
    typedParams.string(`API pinturelliRoot (sketchSetup) q5-function-name (first element of ${command.toString()})`, command[0]);
  }
}

////////////////////////////
//
const nodeDescription = (allNodesByRoot, description) => {

  // root id
  const allNodes = allNodesByRoot.get(description?.rootId);
  if (!allNodes) throwError(`API pinturelliNode (description for "${description?.nodeId}")`, `Root must be declared before any node. Invalid root id: "${description?.rootId}"`); 
  
  // node id
  const nodeId = description?.nodeId;
  typedParams.string(`pinturelliNode (nodeId)`, nodeId);
  if (!/^#[A-Za-z][A-Za-z0-9_-]*$/.test(nodeId)) {
    throwError(`API pinturelliNode`, `"nodeId" must start with "#", then a letter. Subsequent characters, if any, must be letters, digits, hyphens (-) or underscores (_). Invalid id: "${nodeId}"`);
  }
  if (allNodes.has(nodeId)) {
    throwError(`API pinturelliNode (nodeId)`, `The id "${nodeId}" is already in use.`);
  }

  // info
  typedParams.plainObject(`API pinturelliNode (description for "${nodeId}")`, description);
  const uiClass = description?.UiClass;
  if (uiClass) {
    typedParams.string(`API pinturelliNode (UiClass description for "${nodeId}")`, uiClass);
    if (!/^\/[A-Z][A-Za-z0-9_-]*$/.test(uiClass)) {
      throwError(`API pinturelliNode (description for "${nodeId}")`, `"UiClass" must start with "/", then an uppercase letter. Subsequent characters, if any, must be letters, digits, hyphens (-) or underscores (_). Invalid class selector: "${uiClass}"`);
    }
    if (!Object.hasOwn(UiClasses, uiClass.slice(1))) {
      throwError(`API pinturelliNode (description for "${nodeId}")`,  `"UiClass" must be an existing class (declared inside ui/classes/ and exported by ui/UiClasses). Invalid class selector: "${uiClass}"`);
    }
  }
  const uiGestures = description?.UiGestures;
  if (uiGestures) {
    typedParams.array(`API pinturelliNode (description for "${nodeId}") UiGestures`, uiGestures);
    typedParams.string(`API pinturelliNode (description for "${nodeId}") UiGestures elements`, ...uiGestures);
    for (const uiGesture of uiGestures) {
      if (!/^%[A-Z][A-Z0-9_-]*$/.test(uiGesture)) {
        throwError(`API pinturelliNode (description for "${nodeId}")`, `"UiGestures" elements must start with "%", then an uppercase letter. Subsequent characters, if any, must be uppercase letters, digits, hyphens (-) or underscores (_). Invalid gesture driver name: "${uiGesture}"`);
      }
      if (!Object.hasOwn(UiGestures, uiGesture.slice(1))) {
        throwError(`API pinturelliNode (description for "${nodeId}")`, `"UiGestures" elements must be existing driver names (declared inside ui/drivers/ and exported by ui/UiGestures). Invalid gesture driver name: "${uiGesture}"`);
      }
    }
  }
  
  // state
  stateFormat(description.state, nodeId, description.rootId);

  // assets
  assetsFormat(description.localAssets, nodeId, false);

  // paintings
  paintingsFormat(description.paintings);
}

////////////////////////////
//
export default {
	rootDescription,
	nodeDescription,
}