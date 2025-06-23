import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/setup.js";
import checkpoints from "../debug/_checkpoints.js";
import ignoredSetup from "../debug/_ignoredSetup.js";

////////////////////////////
//
export default setSketchSetup = (dependencies, description) => {

  const {
    ALL_NODES,
    SKETCH,
    CAT_PAINTER,
    UI_ROOT,
    treeInitializer,
  } = dependencies;
  
  const {
    WIDTH,
    HEIGHT,
    rootId,
    q5NoAlphaMode,
    q5PixelatedMode,
    q5PixelDensity,
    q5MaxFrameRate,
    memoryTracker,
    sketchSetup,
  } = description;

  //____________
  // instance mutation!!!
  SKETCH.setup = async () => {

    // checkpoint
    const logAssets = {};
    const isTracked = memoryTracker.includes("ASSETS");
    if (flag.log) checkpoints.setupStarted(rootId, isTracked, logAssets);

    // general setup
    SKETCH.createCanvas(WIDTH, HEIGHT, {alpha: !q5NoAlphaMode});
    SKETCH.displayMode(SKETCH.MAXED, q5PixelatedMode);
    SKETCH.pixelDensity(q5PixelDensity);
    SKETCH.frameRate(q5MaxFrameRate);
    SKETCH.noLoop();
    
    // tree creation
    treeInitializer();

    // eager loaded assets
    const accumulatedPromises = new Set();
    ALL_NODES._riskyForEach(node => {
      const assetLoaders = node._initialAssetLoaders;
      if (assetLoaders.length === 0) return;
      const nodePromises = UI_ROOT._loadAssets(node, assetLoaders, logAssets);
      for (const promise of nodePromises) {
        accumulatedPromises.add(promise)
      }
    });
    
    // stops untill all assets are ready
    await Promise.all(accumulatedPromises);

    // custom setup
    for (const [functionName, ...args] of sketchSetup) {

      // prevention
      if (ignoredSetup.some(prefix => functionName.startsWith(prefix))) {
        if (flag.err) apiErrors.ignoredFunction(functionName);
        continue;
      }
      const q5Function = SKETCH[functionName];
      if (typeof q5Function !== "function") {
        if (flag.err) apiErrors.unknownFunction(functionName);
        continue;
      }

      // no argument
      if (args.length === 0) {
        q5Function();
        continue;
      }

      // handle arguments
      q5Function(...args.map(arg => {
        if (typeof arg !== "string") return arg;
        return SKETCH[arg] ?? arg;
      }));
    }

    // initial render
    CAT_PAINTER._firstPaint();
  }
}