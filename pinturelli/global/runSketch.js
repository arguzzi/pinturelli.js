import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/setup.js";
import checkpoints from "../debug/_checkpoints.js";

////////////////////////////
//
export default function runSketch(dependencies, description) {
  const {
    allNodes,
    treeInitializer,
    loadAssets,
    ignoredSetup,
    GLOBAL
  } = dependencies;

  const {
    rootId,
    width,
    height,
    containerId,
    q5NoAlphaMode,
    q5PixelatedMode,
    q5MaxFrameRate,
    memoryTracker,
    sketchSetup,
  } = description;

  //____________
  // canvas container
  const domSelectors = [containerId && `#${containerId}`, `main`, `body`];
  const container = domSelectors.reduce((element, selector) => (
    element || document.querySelector(selector)
  ), null);
  
  // instance creation
  const q5 = new Q5("instance", container);

  // instance metadata
  q5._pinturelli = {
    container,
    assetsBySource: new Map(),
  }

  //____________
  q5.setup = async function() {
    const { assetsBySource } = q5._pinturelli;

    // checkpoint
    const isTracked = memoryTracker.includes("ASSETS");
    if (flag.log) checkpoints.setupStarted(rootId, isTracked, assetsBySource);

    // general setup
    q5.createCanvas(width, height, {alpha: !q5NoAlphaMode});
    q5.displayMode(q5.MAXED, q5PixelatedMode);
    q5.frameRate(q5MaxFrameRate);
    q5.noLoop();
    
    // tree creation
    treeInitializer();

    // eager loaded assets
    const promises = Object.values(allNodes).reduce((acc, node) => {
      const assetLoaders = node._assetLoaders;
      if (assetLoaders.length === 0) return acc;
      acc.push(loadAssets(q5, assetsBySource, assetLoaders, node));
      return acc;
    }, []);

    // stops untill all assets are ready
    await Promise.all(promises);
    
    // custom setup
    for (const [functionName, ...args] of sketchSetup) {

      // prevention
      if (ignoredSetup.some(prefix => functionName.startsWith(prefix))) {
        if (flag.err) apiErrors.ignoredFunction(functionName);
        continue;
      }
      const setupFunction = q5?.[functionName];
      if (typeof setupFunction !== "function") {
        if (flag.err) apiErrors.unknownFunction(functionName);
        continue;
      }

      // no argument
      if (args.length === 0) {
        setupFunction();
        continue;
      }

      // handle arguments
      setupFunction(...args.map(arg => {
        const isString = typeof arg === "string";
        if (!isString) return arg;
        const finalArg = q5?.[arg];
        if (flag.err && !finalArg) apiErrors.unknownArgument(arg);
        return finalArg;
      }));
    }

    // initial render
    GLOBAL.CAT_PAINTER._firstPaint();
  }

  //____________
  return q5;
}
