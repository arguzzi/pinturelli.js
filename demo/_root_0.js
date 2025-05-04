const _root_0 = pinturelliRoot({
  debugSelector: "*", // Default: "" (none)
  // // alt: string <--selectAll (with rootId as the automatic origin)
  // // alt: or strings array <--list of ids [nodeId, nodeId, ...]
  customRootId: "_root_0", // Default: `_root_${rootCount}`. Must starts with "_"
  containerId: "sketch_container_0", // Default: none (caputre main or body)
  resolutionX: 540,  // Default: 540. Inner resolution, not final size
	// resolutionY: 540,  // Default: null (auto). If both x/y are set = fixed ratio
  // proportion: 1, // Default: null (container ratio). Overwridden if x/y are both set
	// q5WebGpuMode: true, // Default: false
	// q5PixelatedMode: true, // Default: false
  // q5NoAlphaMode: true, // Default: false

  rootAssets: { // Default: {}
    dejavu: ["loadFont", "fonts/DejaVuSans.ttf"],
    ambientMusic: [
      "loadSound",
      "sound/ambient.mp3",
      () => console.log("ambient.mp3 oki"),
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
});