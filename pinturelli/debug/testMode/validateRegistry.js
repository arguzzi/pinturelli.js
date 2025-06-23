import { typedParams } from "../_typeValidators.js";
import { throwError } from "../_debugOutput.js";

//////////////////////////////
//
const getSingleton = dependencies => {
	const { createGlobal, getStateManagers, UiGestures, UiClasses } = dependencies;
	typedParams.plainObject(`__DEV__`, dependencies, getStateManagers, UiGestures, UiClasses);
	typedParams.function(`__DEV__`, createGlobal, ...Object.values(getStateManagers), ...Object.values(UiClasses));
}

//////////////////////////////
//
const constructorCall = (internalKey, externalKey) => {
	typedParams.symbol(`__DEV__`, internalKey, externalKey);
	if (internalKey === externalKey) return;
	throwError(`__DEV__`, `Invalid call to Registry constructor`);
}

//////////////////////////////
//
const allNodesProxyCreator = (allNodes, rootId) => {
	typedParams.map(`allNodesProxyCreator allNodes`, allNodes);
	typedParams.string(`allNodesProxyCreator rootId`, rootId);
}

//////////////////////////////
//
export default {
	getSingleton,
	constructorCall,
	allNodesProxyCreator,
}