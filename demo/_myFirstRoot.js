const myFirstRoot = pinturelliRoot({
/* 00 */  customRootId: "_myFirstRoot", // Default: `_root_${rootCount}` | Must starts with "_"
/* 01 */  containerId: "sketch_container_0", // Default: null (auto: main elt, or body elt)
/* 02 */  resolutionX: 540,  // Default: 540 | Inner resolution, not final size | Nullable
/* 03 */  resolutionY: 540,  // Default: null (auto: needs proportion) | If both x/y are set = fixed ratio
/* 04 */  proportion: 1, // Default: null (auto: needs one resolution) | Overwridden if x/y are both set
/* 05 */  // q5NoAlphaMode: true, // Default: false
/* 06 */  // q5PixelatedMode: true, // Default: false
/* 07 */	// q5MaxFrameRate: 30, // Default: 60
/* 08 */  nodesTracker: "*", // Default: []
/*    */  // ^ ^ alt: string <--selectAll (with root preconfigured as the origin)
/*    */  // ^ ^ alt: array of strings <--list of ids [nodeId, nodeId, ...]
/* 09 */  eventsTracker: ["$tapped"], // Default: [] | Semantic names array
/* 10 */  memoryTracker: ["ALL_NODES"], // Default: ["ALL_NODES"]
/*    */  // ^ ^ alt: ["GLOBAL", "ALL_NODES", "ASSETS", "EVENT_BUS"]
/* 11 */  globalAssets: { // Default: {}
/*    */  	touch: ["loadImage", "assets/touch.png"],
/*    */  	video: ["createVide", "assets/video.mp4", vid => {
/*    */			vid.muted = true;
/*    */			vid.loop = true;
/*    */			vid.play();
/*    */		}],
/*    */  },
/* 12 */  sketchSetup: [ // Default: []
/*    */    ["cursor", "CROSS"],
/*    */    ["mouseX", Infinity],
/*    */    ["colorMode", "RGB", 255],
/*    */    ["textAlign", "CENTER", "CENTER"],
/*    */    ["textSize", 18],
/*    */    ["noFill"],
/*    */    // ignored: preload, setup, draw, displayMode, flexibleCanvas, loop, noLoop, redraw, and any create/load function
/*    */  ],
/* __ */});
