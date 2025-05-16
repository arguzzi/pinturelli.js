// import dbgr from "../debug/validatePainter.js";

export default class Painter {
  #dirtyLayers = new Map();
  #paintQueue = new Map();

  #isPainting = false;
  #lastSnapshot = 0;

  #snapshots = new Map();
  #sequences = new Map();

  #nextFrameTimeout = null;
  #nextFrameRequested = false;

  #allLayers = {};
  #getTree;
  #sketch;

  //____________
  constructor(getTree, sketch) {
    this.#getTree = getTree;
    this.#sketch = sketch;

    sketch.draw = () => {
      if (this.#snapshots.size !== 0 || this.#sequences.size !== 0) {
        const dirtyLayers = {};
        for (const snapshot of this.#snapshots) {
          
        }
        this.#snapshots = new Map();
      }

      if (0) {
        for (const sequence of this.#sequences) {
          this.#paintLayer(sequence.__layer, sequence);
        }
        this.#sequences = new Map();
      }

      sketch.clear();
      for (const layer of Object.values(this.#allLayers)) {
        sketch.image(layer, 0, 0);
      }
    }
  }

  //____________
  get isPainting() {
    return this.#isPainting;
  }

  //____________
  #paintLayer(layer, node, ) {

  }

  //____________
  #enqueueSnapshot(rxSymbol, reactionConfig) {
    this.#snapshots.set(rxSymbol, reactionConfig);

    if (this.#isPainting || this.#nextFrameRequested) return;
    this.#nextFrameRequested = true;
    this.#nextFrameTimeout = setTimeout(() => {
      const getter = reactionConfig.__receiver._passiveManager.get;
      const zLayer = Math.max(0, getter("treeLayer") + getter("nodeLayer"));
      this.#paintLayer(zLayer, reactionConfig);
    }, 0);
  }

  //____________
  #enqueueSequence(rxSymbol, reactionConfig) {
    const callback = () => {

    }

    const sequence = {
      ...reactionConfig,
      __startedAt: performance.now(),
      __timeout: setTimeout(callback, reactionConfig.duration),
    }

    this.#sequences.set(rxSymbol, sequence);

    if (this.#isPainting) return;
    this.#isPainting = true;
  }

  //____________
  _setReaction(rxSymbol, reactionConfig) {
    if (reactionConfig.duration === 0) {
      this.#enqueueSnapshot(rxSymbol, reactionConfig);
      return;
    }
    this.#enqueueSequence(rxSymbol, reactionConfig);
  }

  //____________
  _cancelReaction(rxSymbol) {
    // this.#paintQueue.delete(rxSymbol);
  }

  //____________
  _getTimeManager(rxSymbol) {
  }

  //____________
  _initializeLayers() {
    const visibleNodes = this.#getTree("*").filter(node => {
      const getS = node._passiveManager.get; // state manager
      return getS("subtreeVisibile") && getS("nodeVisibile");
    });

    for (const node of visibleNodes) {
      const getter = node._passiveManager.get; // state manager
      const zLayer = Math.max(0, getter("treeLayer") + getter("nodeLayer"));

      if (!Object.hasOwn(this.#allLayers, zLayer)) {
        this.#allLayers[zLayer] = this.#sketch.createGraphics(
          this.#sketch.width,
          this.#sketch.height
        );
      }

      const width = getter("width");
      const height = getter("height");
      const buffer = this.#sketch.createGraphics(width, height);
      const blank = { 
        get: () => 0,
        getByKeys: () => 0,
        riskyPatch: () => 0,
        riskyPatchByObject: () => 0,
        riskyRelay: () => 0,
      };

      const paint = node._paintings[getter("painting")];
      const snapshot = paint(buffer, node._passiveManager, blank, blank);
      this.#allLayers[zLayer].image(snapshot, 0, 0);
    }
  }

  //____________
  #updateLayers(node, patchedState) {
    const getter = node._passiveManager.get;
    const zLayer = Math.max(0, getter("treeLayer") + getter("nodeLayer"));

    if (!this.#allLayers[zLayer]) {
      this.#allLayers[zLayer] = this.#sketch.createGraphics(
        this.#sketch.width, this.#sketch.height
      );
    }
    const buf = this.#sketch.createGraphics(getter("width"), getter("height"));
    const paintFn = node._paintings[getter("painting")];
    const snapshot = paintFn(buf, node._passiveManager, this.data, this.time);
    this.#allLayers[zLayer].image(snapshot, 0, 0);
  }

  //____________
  notifyPatch(node, patchedState) {
  }

  //____________
  schedulePainter() {
    if (this.#isPainting) return;
    this.#sketch.redraw();
  }
}




/*
export default class Renderer {
  #paintings = [];
  #control = {};

  //____________
  constructor(GLOBAL) {
    this.GLOBAL = GLOBAL;
    this.SKETCH = GLOBAL.SKETCH;
    
    // global timer
    this.SKETCH.loop();
    this.#control.duration = 1;
    this.#control.startedAt = performance.now();
    this.#control.timeout = setTimeout(() => {
      this.SKETCH.noLoop();
      this.#control.timeout = null;
    }, this.#control.duration);

    // render loop
    this.SKETCH.draw = () => {
      this.SKETCH.clear();
      for (let i = this.#paintings.length - 1; i >= 0; i--) {
        const painting = this.#paintings[i];
        this.SKETCH.push();

        // static
        if (!painting.isAnimation) {
          painting.paint(this.SKETCH, painting.node, 0);
          this.SKETCH.pop();
          this.#paintings.splice(i, 1);
          continue;
        }

        // animation
        const elapsed = performance.now() - painting.startedAt
        painting.paint(this.SKETCH, painting.node, elapsed);
        this.SKETCH.pop();
      }
    }
  }

  //____________
  addPainting(node, paintFunction, animationDuration) {
    this.removePainting(node);

    // inverse order (higher prioriy in left)
    const priority = this.GLOBAL.DRAW_LIST.indexOf(node);
    const index = this.#paintings.findIndex(p => priority > p.priority);
    const position = index === -1 ? this.#paintings.length : index;

    // static
    if (typeof animationDuration !== "number" || animationDuration <= 0) {
      this.#paintings.splice(position, 0, {
        priority: priority,
        isAnimation: false,
        paint: paintFunction,
        node: node,
      });

      if (this.#control.timeout === null) this.SKETCH.redraw();
      return;
    }

    // animation
    this.#paintings.splice(position, 0, {
      priority: priority,
      isAnimation: true,
      startedAt: performance.now(),
      paint: paintFunction,
      node: node,
    });

    // if was paused
    if (this.#control.timeout === null) {
      this.SKETCH.loop();
      this.#control.duration = animationDuration;
      this.#control.startedAt = performance.now();
      this.#control.timeout = setTimeout(() => {
        this.SKETCH.noLoop();
        this.#control.timeout = null;
      }, this.#control.duration);
      return;
    }

    // if was running
    const willFinishAt = this.#control.startedAt + this.#control.duration;
    const remainigTimer = willFinishAt - performance.now();
    if (remainigTimer >= animationDuration) return;

    const extraDuration = animationDuration - remainigTimer;
    this.#control.duration = this.#control.duration + extraDuration;
    clearTimeout(this.#control.timeout);
    this.#control.timeout = setTimeout(() => {
      this.SKETCH.noLoop();
      this.#control.timeout = null;
    }, animationDuration);
  }

  //____________
  removePainting(node) {
    const index = this.#paintings.findIndex(p => node === p.node);
    if (index !== -1) this.#paintings.splice(index, 1);
  }

  //____________
  addLoopedPainting(node, paintFunction, loopDuration) {
  }

  //____________
  removeLoopedPainting(node) {
  }
}



// setSingleFrame(node, paintings) {
// }

// setAnimation(node, duration, paintings, callback) {
// }

// setLoopAnimation(node, duration, paintings) {
// }

// stopAnimation(node) {
// }
  //____________
  // q5.draw = function() {
  //   q5.background(225, 80, 50, 20);
  //   q5.fill((q5.frameCount % 255) * 0.5 + 65, 100, (q5.frameCount % 255) * 0.5 + 65);
  //   q5.circle(q5.width / 2, q5.height / 2, 540);
  //   q5.fill(q5.frameCount % 255, 100, 190);
  //   q5.circle(q5.width / 2, q5.height / 2, 200);
  // }

  // */