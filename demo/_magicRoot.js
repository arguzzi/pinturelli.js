
const _magicRoot = pinturelliRoot({
/* (A) */ customRootId: "_magicRoot", // Default: `_root_${rootCount}` | Must starts with "_"
/* (B) */ containerId: "magic-container", // Default: null (auto: main elt, or body elt)
/* (C) */ resolutionX: 540,  // Default: 540 | Inner resolution, not final size | Nullable
/* (D) */ resolutionY: 540,  // Default: null (auto: needs proportion) | If both x/y are set = fixed ratio
/* (E) */ proportion: 1, // Default: null (auto: needs one resolution) | Overwridden if x/y are both set
/* (F) */ // q5NoAlphaMode: true, // Default: false
/* (G) */ // q5PixelatedMode: true, // Default: false
/* (H) */ // q5PixelDensity: 2, // Default: 1
/* (I) */ // q5MaxFrameRate: 30, // Default: 60
/* (J) */ generalTracker: ["ALL_NODES", "GLOBAL", "ASSETS"], // Default: ["ALL_NODES"]
/*     */ // ^ ^ alt: ["CONFIG", "GLOBAL", "ALL_NODES", "ASSETS", "EVENT_BUS"]
/* (K) */ memoryTracker: ["#someId"], // Default: [] | Node ids array (all: "*")
/* (L) */ eventsTracker: ["*"], // Default: [] | Semantic names array (all: "*")
/* (M) */ rootAssets: { // Default: {}
/*     */   touch: ["loadImage", "assets/touch.png"],
/*     */  	video: ["createVide", "assets/video.mp4", vid => {
/*     */     vid.muted = true;
/*     */      vid.loop = true;
/*     */      vid.play();
/*     */    }],
/*     */  },
/* (N) */  sketchSetup: [ // Default: []
/*     */    ["cursor", "CROSS"],
/*     */    ["mouseX", Infinity],
/*     */    ["colorMode", "RGB", 255],
/*     */    ["textAlign", "CENTER", "CENTER"],
/*     */    ["textSize", 18],
/*     */    ["noFill"],
/*     */    // ignored: preload, setup, draw, displayMode, flexibleCanvas, loop, noLoop, redraw, and any create/load function
/*     */  ],
});
