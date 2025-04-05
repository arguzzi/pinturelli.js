// import UiNode from "../UiNode.js";
// import noClick from "../mixins/noClick.js"

// export default class Block extends noClick(UiNode) {
//   constructor(args) {
//     super(args);
//   }

//   display() {
//     this.SKETCH.fill("blue");
//     this.SKETCH.rect(this.x, this.y, this.w, this.h);
//   }
// }

import UiCore from "../UiCore.js";

export default class Block extends UiCore {
  constructor(...args) {
    super(...args);
  }

  display() {
    this.SKETCH.fill("blue");
    this.SKETCH.rect(this.x, this.y, this.w, this.h);
  }
}