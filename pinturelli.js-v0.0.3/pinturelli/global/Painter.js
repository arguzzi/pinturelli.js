import dbgr from "../debug/validateRenderer.js";

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
