import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/loads.js";

////////////////////////////
//
export default function loadAssets(q5, assetsBySource, assetLoaders, node) {
	const { nodeId, _setAsset } = node;
	const nodePromises = [];

	// accumulation
	// loader = [loadFunction, source, successCallback]
	for (const [name, loader] of assetLoaders) {
		const [loadFunction, source, successCallback] = loader;

		// was already requested
		const requestedAsset = assetsBySource.get(source);
		if (requestedAsset) {
			requestedAsset._usedBy.add(nodeId);
			_setAsset(name, requestedAsset); // from cache
			continue;
		}

		// first time requested
		const promise = q5[loadFunction](source).then(loadedAsset => {
			loadedAsset._usedBy = new Set([nodeId]);
			assetsBySource.set(source, loadedAsset); // memory update
			_setAsset(name, loadedAsset); // from new request
			successCallback(loadedAsset);
		});

		// error case
		if (flag.err) promise.catch(error => {
			apiErrors.assetFailed(nodeId, name, loader, error);
		});

		// output mutation
		nodePromises.push(promise);
	}

	return nodePromises;
}
