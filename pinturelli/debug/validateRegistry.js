import { typedParams } from "./_typeValidators.js";
import { throwError } from "./_debugOutput.js";

//////////////////////////////
//
const getSingleton = imports => {
  typedParams.plainObject(`Registry (getSingleton) imports`, imports);
  typedParams.function(`Registry (getSingleton) imports.createGlobal`, imports?.createGlobal);
  
  const managers = imports?.stateManagers;
  typedParams.plainObject(`Registry (getSingleton) imports.stateManagers`, managers);
  typedParams.function(`Registry (getSingleton) imports.stateManagers props`, ...Object.values(managers));

  const gestures = imports?.UiGestures;
  typedParams.plainObject(`Registry (getSingleton) imports.UiGestures`, gestures);
  typedParams.object(`Registry (getSingleton) imports.UiGestures props`, ...Object.values(gestures));

  const classes = imports?.UiClasses;
  typedParams.plainObject(`Registry (getSingleton) imports.UiClasses`, classes);
  typedParams.function(`Registry (getSingleton) imports.UiClasses props`, ...Object.values(classes));
}

//////////////////////////////
//
const constructorCall = (singletonKey, secretKey) => {
  if (singletonKey === secretKey) return;
  throwError(`Registry (constructor)`, `Pinturelli's memory cannot be instantiated directly. Use "Registry.getSingleton()" to access the instance.`);
}

//////////////////////////////
//
const allNodesProxyCreator = (rootId, allNodes) => {
  if (allNodes) return;
  throwError(`Registry (allNodesProxyCreator)`, `Invalid rootId: "${rootId}"`);
}

//////////////////////////////
//
export default {
  getSingleton,
  constructorCall,
  allNodesProxyCreator,
}