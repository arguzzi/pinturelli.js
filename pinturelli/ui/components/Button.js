import UiNode from "../UiNode.js";
import click from "../mixins/click.js"

export default class Button extends click(UiNode) {
  constructor(args) {
    super(args);
  }

  display() {
    fill("red");
    rect(this.x, this.y, this.w, this.h);
  }
}