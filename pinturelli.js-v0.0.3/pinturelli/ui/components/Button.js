// import UiNode from "../UiNode.js";
// import click from "../mixins/click.js"

// export default class Button extends click(UiNode) {
//   constructor(args) {
//     super(args);
//   }

//   display() {
//     this.SKETCH.fill("red");
//     this.SKETCH.rect(this.x, this.y, this.w, this.h);
//   }
// }

import UiCore from "../UiCore.js";

export default class Button extends UiCore {
  constructor(...args) {
    super(...args);
  }

  display() {
    this.SKETCH.fill("red");
    this.SKETCH.rect(this.x, this.y, this.w, this.h);
  }
}