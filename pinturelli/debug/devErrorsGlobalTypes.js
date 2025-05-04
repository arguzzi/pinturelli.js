import { typedParams } from "./_types.js";

//////////////////////////////
//
const globalDescription = (description) => {
  const {
    containerId = "",
    resolutionX = 540,
    resolutionY = 0,
    proportion = 1,
    debugMode = false,
    q5WebGpuMode = false,
    q5PixelatedMode = false,
    q5NoAlphaMode = false,
  } = description;

  typedParams.string(`pinturelliRoot (1st argument)`, containerId);
  typedParams.number(`pinturelliRoot (1st argument)`, resolutionX, resolutionY, proportion);
  typedParams.boolean(`pinturelliRoot (1st argument)`, debugMode, q5WebGpuMode, q5PixelatedMode, q5NoAlphaMode);
  
  typedParams.plainObject(`pinturelliRoot (1st argument)`, globalAssets);
  for (const [assetName, q5operation] of globalAssets.entries()) {
    typedParams.array(`pinturelliRoot (1st argument) in globalAssets--> ${assetName}`, q5operation);
    typedParams.string(`pinturelliRoot (1st argument) in globalAssets--> ${assetName}`, q5operation[0]);
  }

  typedParams.array(`pinturelliRoot (1st argument)`, sketchSetup);
  for (const q5operation of sketchSetup) {
    typedParams.array(`pinturelliRoot (1st argument) in sketchSetup`, q5operation);
    typedParams.string(`pinturelliRoot (1st argument) in sketchSetup`, q5operation[0]);
  }
}

//////////////////////////////
//
export default {
  globalDescription,
}


/*
{
  customRootId: "_root_0", // Default: `_root_${count}`. Must starts with "_"
  containerId: "sketchContainer0", // Default: none (caputre main or body)
  resolutionX: 540,  // Default: 540. Inner resolution, not final size
	// resolutionY: 540,  // Default: 0 (auto). If both x/y are set = fixed ratio
  // proportion: 1, // Default: container ratio. Overwridden if x/y are both set
  debugMode: true, // Default: false
	// q5WebGpuMode: true, // Default: false
	// q5PixelatedMode: true, // Default: false
  // q5NoAlphaMode: true, // Default: false

  globalAssets: { // Default: {}
    dejavu: ["loadFont", "fonts/DejaVuSans.ttf"],
    ambientMusic: [
      "loadSound",
      "sound/ambient.mp3",
      () => console.log("ambient.mp3 oki")
    ],
  },

  sketchSetup: [
    ["frameRate", 30], // Default: 60
    ["colorMode", "HSB", 1], // Default: "RGB", 1
    ["textAlign", "CENTER", "CENTER"], // No default
    ["textSize", 18], // No default
    ["noStroke"], // No default
    ["mouseX", Infinity], // No default
    ["mouseY", Infinity], // No default
    ["cursor", "CROSS"], // No default
    // ignored: displayMode, flexibleCanvas, any create/load function
  ],
}

// */