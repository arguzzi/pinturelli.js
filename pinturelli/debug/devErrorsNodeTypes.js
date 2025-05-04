import { typedParams } from "./_typeValidators.js";

//////////////////////////////
//
const nodeDescription = (description) => {
  const {
    labels = [],
    UiGestures = [],
  } = description;

  typedParams.array(`pinturelliNode (1st argument)`, labels, UiGestures);
  if (labels.length > 0) {
    for (const label of labels) {
      typedParams(`pinturelliNode (1st argument)--> labels`, ``)
    }
  }

  typedParams.number(`pinturelliRoot (1st argument)`, resolutionX, resolutionY, proportion);
  typedParams.boolean(`pinturelliRoot (1st argument)`, debugMode, q5WebGpuMode, q5PixelatedMode, q5NoAlphaMode);
  
  typedParams.object(`pinturelliRoot (1st argument)`, globalAssets);
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
  nodeDescription,
}

/*
{
  //_______
  id: "magicButton", // Required, no default (always camelCase)
  root: "_root_0", // Required, no default (always start with "_")
  labels: ["magic", "somethingElse"], // Default: [] (always camelCase)
  UiClass: "Button", // Default: "Block" | alt: "Void" "TextBox" "DomProxy" etc (always PascalCase)
  UiGestures: ["$hold", "$drag"], // Default: [] (always start with "$")

  //_______
  assets: { // Default: {}
    pepo: ["loadImage", "img/pepo.jpg"],
    nsdt: [
      "loadSound",
      "sound/nsdt.mp3",
      () => console.log("nsdt.mp3 oki"),
    ],
    // node.assets is a read-only proxy. to add lazy loaded assets use:
    // node.loadAsset(key, "function", "source", ...callbacks)
  },

  //_______
  // numeric units -> canvas inner resolution
  // strings -> pseudo css horizontal units: ".1" "0.1" "1%" "1px" "1rem" "1vw"
  // strings -> pseudo css vertical units: ".1" "0.1" "1%" "1px" "1rem" "1vh"
  state: {
    followingId: "centralBox", // Default: root
    left: 30, // Default: 0 | alt: (horizontal units) | like position css
    // right: 10, // No default | if both left/right are set = automatic width
    top: 20, // Default: 0 | alt: (vertical units) | like position css
    // bottom: 80, // No default | if both top/bottom are set = automatic height
    widht: 300, // Default: 100 | overwridden if left/right are both set
    height: 300, // Default: 50 | overwridden if top/bottom are both set
    // proportion: 1/4, // No default | overwridden if width/heigth are both set
    offsetX: 10, // Default: 0 | alt: (horizontal units) | like translate css
    offsetY: 40, // Default: 0 | alt: (vertical units) | like translate css
    originX: "0.5", // Default: 0 | alt: (horizontal units) | like translate q5
    originY: "0.5", // Default: 0 | alt: (vertical units) | like translate q5
    layer: 2, // Default: 0 | like z-index css
    visibility: true, // Default: false
    painting: "firstAnim", // Default: "_empty" | if debugMode Default: "_debug"
    // >> node.state is a read-only proxy.
    // >> to change any value use:
    // >> node.setState(key, value)
    // >> (*) also useful for creating new properties at runtime.
    // >> (**) any change to the state will trigger the Painter.
  },

  //_______
  history: {
    globalStates: ["visibility"], // Default: []
    hashedStates: [], // Default: []
  },

  paintings: { // Default: { _empty, _debug }
    _empty: () => {},
    _debug: (q5, getState) => {
      q5.strokeWeight(2);
      q5.stroke(0.3, 0.6, 0.9, 0.7);
      q5.fill(0.9, 0.5, 0.5, 0.2);
      q5.rect(0, 0, getState("widht"), getState("height"), 8);
    },

    firstAnim: (q5, getState, getData, getTime) => {
      q5.translate(...getState("firstPosition"));
    },
    
    mainLoop: (q5, getState, getData, getTime) => {
    },

    tappedAnim: (q5, getState, getData, getTime) => {
    },

    pressedLoop: (q5, getState, getData, getTime) => {
    },

    draggedLoop: (q5, getState, getData, getTime) => {
    },
    
    crazyAnim: (q5, getState, getData, getTime) => {
    },
  },
}
// */