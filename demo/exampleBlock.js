////////////////////////////////////////////
//
const exampleBlock = pinturelliNode({

  //_______
  id: "exampleBlock", // Required
  rootId: "_root_0", // Required
  UiClass: "Block", // Default: "Block"
  UiGestures: ["$tap"], // Default: []

  //_______
  state: {
    labels: [], // Default: []
    followingId: "_root_0", // Default: rootId
    left: 30, // Default: 0
    top: 20, // Default: 0
    width: 100, // Default: 100
    height: 50, // Default: 50
    offsetX: 10, // Default: 0
    offsetY: 40, // Default: 0
    treeVisibility: true, // Default: true
    nodeVisibility: true, // Default: true
    treeLayer: 1, // Default: 0
    nodeLayer: 1, // Default: 0
    painting: "myFirstBackground", // Default: "_empty"
  },

  //_______
  assets: {}, // Default: {}

  //_______
  paintings: { // Default/always: { _empty, _debug }
    myFirstBackground: (buffer, state, data) => {
      buffer.background(10, 90, state.get("blue"));
      buffer.fill(255);
      buffer.circle(data.get("cnv_x"), data.get("cnv_y"), 80);
    },

    myFirstPainting: (buffer, state, data, time) => {
      const ms = time.get("ms");
      const red = state.get("red");
      buffer.background(red, 60, 240);
      buffer.fill(200, 200, 10);
      buffer.circle(10, 10, 20);
      buffer.fill(100, 80, 255);
      buffer.circle(ms / 10, 10, 20);
    },
  },
});

////////////////////////////////////////////
//
exampleBlock.hear("$gesture_started", "$", {
  first: {
    config: {
      requireData: ["$cnv_x", "$cnv_y"], // Default: []
      propagation: false, // Default: false
    },
    validate: [],
    update: () => {},
  },

  //_______
  snapshots: [
    {
      config: {
        token: "100", 
        startAt: 0, // Default: 0
      },
      
      validate: [],

      update: (state, data, time) => {
        state.set(blue, Math.random() * 255);
      },
    },
  ],
});

////////////////////////////////////////////
//
exampleBlock.hear("$tapped", "$", {
  first: {
    config: {
      requireData: ["$cnv_x", "$cnv_y"], // Default: []
      propagation: false, // Default: false
    },
    validate: [],
    update: () => {},
  },

  //_______
  sequences: [
    {
      config: {
        token: "123", 
        startAt: 0, // Default: 0
        duration: 2_000, // Default: 300
      },
      
      validate: [],

      update: (state, data, time) => {
        state.set(red, Math.random() * 255);
      },
    },
  ],
});

