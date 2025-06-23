////////////////////////////////////////////
//
const magicButton = pinturelliNode({

  //_______
  // node info (inmutable)
  rootId: "_root_0", // Required, no default | always starts with "_"
  nodeId: "#magicButton", // Default: null (get random id) | always starts with "#"
  UiClass: "/Button", // Default: "/Block" | alt: "/Void" | always PascalCase and starts with "/"
  UiGestures: ["%HOLD", "%DRAG"], // Default: [] | always UPPER_CASE and starts with "%"

  //_______
  // numeric -> canvas inner resolution unit
  // strings -> pseudo css units: ".1" "0.1" "1%" "1px" "1rem"
  state: {
    followingId: "_root_0", // Default: rootId
    labels: ["magic", "somethingElse"], // Default: [] | always camelCase
    left: 30, // Default: 0 | alt: horizontal units | like position css
    // right: 10, // Default: null | if both left/right are set = automatic width
    top: 20, // Default: 0 | alt: vertical units | like position css
    // bottom: 80, // Default: null | if both top/bottom are set = automatic height
    width: 300, // Default: 100 | overwridden if left/right are both set
    height: 300, // Default: 150 | overwridden if top/bottom are both set
    // proportion: 1/4, // Default: null | overwridden if width/heigth are both set
    offsetX: 10, // Default: 0 | alt: horizontal units | like translate css
    offsetY: 40, // Default: 0 | alt: vertical units | like translate css
    nodeLayer: 2, // Default: 0 | treeLayer + nodeLayer = pseudo css z-index
    treeLayer: 1, // Default: 0 | recursive propagation
    insideLayer: 3, // Default: 0 | like css z-index
    // nodeVisibility: false, // Default: true | shadowed by treeVisibility
    // treeVisibility: false, // Default: true | recursive propagation
    // layerVisibility: false, // Default: true | horizontal propagation
    // nodePermanency: false, // Default: true | shadowed by treePermanency
    // treePermanency: false, // Default: true | recursive propagation
    // layerPermanency: false, // Default: true | horizontal propagation
    painting: "firstAnim", // Default: "_empty" | if debugging Default: "_debug"
    overlayedPainting: "staticShapes", // Default: "_empty"
  },

  //_______
  nodeAssets: { // Default: {}
    pepo: ["loadImage", "img/pepo.jpg"],
    nsdt: [
      "loadSound",
      "sound/nsdt.mp3",
      () => console.log("nsdt.mp3 oki"),
    ],
  },

  //_______
  paintings: { // Default/always: { _empty, _debug }
    // _empty: () => {},

    _debug: ({ buffer, state }) => {
      buffer.strokeWeight(2);
      buffer.stroke(0.3, 0.6, 0.9, 0.7);
      buffer.fill(0.9, 0.5, 0.5, 0.2);
      buffer.rect(0, 0, state.get("width"), state.get("height"));
    },

    firstAnim: ({ Q, B, S, D, T }) => {
      buffer.translate(...state.get("firstPosition"));
    },
    
    mainLoop: (q5, gr, st, da, ti) => {
    },

    tappedAnim: (q5, gr, st, da, ti) => {
    },

    pressedLoop: (q5, gr, st, da, ti) => {
    },

    draggedLoop: (q5, gr, st, da, ti) => {
    },
    
    crazyAnim: (q5, gr, st, da, ti) => {
    },
  },
});

////////////////////////////////////////////
//
magicButton.listen("$", "$gesture_started", {
  middlewares: [
    (state, data) => true,
    (state, data) => true,
  ],
});

////////////////////////////////////////////
//
magicButton.listen("$", "$tapped", {
  // listen method is to describe the reaction to a primary event.
  // primary events are the ones emited from emitter-dispatcher, not from eventbus.
  // recieve nameEvent as 1st param, and description as 2nd

  //_______
  firstConfig: {
    requireData: ["$canvas_x", "$canvas_y"], // Default: [] | always: $name
    propagation: true, // Default: false | means automatic re-emit this event in my channel
    bubbling: true, // Default: false | means automatic re-emit this event in next collisioned node channel
  },

  firstMiddleware: (state, data) => {
    state.riskyPatchByObject({ ok: state.get("gior") + data.get("$gio") });
    data.riskyPatch("initialTime", performance.now());
    return true;
  },

  firstMiddlewares: [
    (state, data) => true,
    (state, data) => true,
  ],

  // if configured, automatic propagation...
  // ...happens here (before reactions)

  //_______
  reaction: {
    config: {
      startAt: 2300, // Default: 0 (now)
    },

    update: (state, data) => {
      const newPositionY = data.get("$canvas_y") + state.get("lastPositionY");
      state.setByObject({
        key0: state("key0") + 1,
        lastPositionY: newPositionY
      });
    },
  },

  //_______
  reactions: [
    {
      config: {
        token: "", // Default: `${channelId} ${message} ${nodeId} ${repeatNumber}` used by painter
        startAt: 8, // Default: 0 (now)
        riskyRepeat: 3, // Default: 0 (no repeat)
        cancelByToken: ["token", "otherToken"], // string or array of strings
        cancelBySelector: ["path", "otherPath"], // string or array of strings
        cancelBySelectorAll: "singlePath", // string or array of strings
      },

      middlewares: [(state, data) => true],

      update: (state, data, time) => {
        data.set(exampleData, data.get("hi") + "pepo");
        
        const middleX = data.get("$canvas_x") / 2;
        const newPositionX = state.get("lastPositionX") + middleX;
        state.setByObject({
          key0: state.get("key0") + 1,
          lastPositionX: newPositionX,
        });

        const name = state.get("giorgio");
        data.setByObject({
          exampleData: "overwritten",
          myName: data("is") + name,
        });
      },
      
      relays: [ // Default: []
        { message: "actived", channels: ["#", "@exampleChannel"] }, // "#" means this-node. channelId always starts with "@"
        { relayAt: 20, message: "startCrazy" }, // if channels is undefined or empty, default = ["#"]. relayAt's default = 0
        { channels: ["@magicChannel"] }, // if message is undefined, default: received message. if channels is not empty, "#" is not asumed
      ],
    },
    {
      config: {
        token: "exampleToken", // Default: [channelId, message, receiverId, riskyRepeat, repetitionNumber].toString() used for stopping this animation later
        startAt: 8, // Default: 0 (now). always in ms
        duration: 2_900, // Default: 300 (short animation). always in ms
        riskyRepeat: 3, // Default: 0 (no repeat). this example = repeat tree times. inifnite loop = -1, alternating loops = -2: (yes, no, yes, no, etc) or -3: (yes, no, no, yes, etc) or any -int
        useTime: ["percent", "easy", "easyIn", "easyOut", "easyInOut"], // Default: []. always: "ms", "animFrame" and "nodeFrame" 
        useTimeBezier: { exampleBezier: [0, 5.43, 0.3, -1.56] }, // Default: [] // params: [x1, y1, x2, y1] (like css cubic-bezier)
        useTimeSteps: { exampleSteps: [4, "start"], otherSteps: [12, "both"] }, // Default: [] // params: [number of steps, start/end/both] (like css steps)
      },

      update: (state, data, time) => {
        const positionY = data.get("$canvas_y") + time.get("easy");
        state.setByObject({ lastPositionY: positionY + state.get("centerY") });
        return true; // forces the paint to execute even if no state is set
      },

      lastUpdate: (state, data) => {
        return true; // forces the paint to execute even if no state is set
      }
    },
    {
      config: {
        startAt: 12000, // Default: 0 (now). always in ms
      },

      middlewares: [
        () => Math.random() < 0.5,
        state => state.get("painting") === "firstAnim",
        (state, data) => state.get("nameExpected") === data.get("$name"),
      ],

      relays: [
        { message: "loremIpsum1" }, // assumed channels: "#" and relayAt: 0
        { message: "loremIpsum2", relayAt: 12 }, // assumed channels: "#"
        { message: "loremIpsum3", channels: ["@chB", "@ch78"], relayAt: 12 },
      ],
    }
  ],
});

////////////////////////////////////////////
//
magicButton.listen("$", "$dragging_held", {
  firstConfig: {},
  firstValidate: [],
  firstUpdate: () => {},
  reaction: {},
  reactions: [{}, {}],

  // a node can listen multiple primary events.
  // but: each primary event can have only one handler per node.
});

////////////////////////////////////////////
//
magicButton.listen("magicButton2", "$tapped", {
  firstConfig: {},
  firstValidate: [],
  firstUpdate: () => {},
  reaction: {},

  // a node can listen re-emitted messages.
  // in this case, its listening to the re-emission of a primary event
  // from "magicButton2" node (probably via automatic propagation).
});

////////////////////////////////////////////
//
magicButton.listen("someNodeId_or_@someChannel", "doSomeMagic", {
  firstConfig: {},
  firstValidate: [],
  firstUpdate: () => {},
  reactions: [{}, {}],

  // in this case, its listening to a message from other node.
  // this is a "spoken message" (not a primary event)
});

////////////////////////////////////////////
//
export default magicButton;
