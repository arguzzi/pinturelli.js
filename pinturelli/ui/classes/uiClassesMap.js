import Void from "./_00_Void.js";
import Block from "./_01_Block.js";
import Button from "./_02_Button.js";
import DomProxy from "./_03_DomProxy.js";
import TextBox from "./_04_TextBox.js";

const allClasses = {
  Void,
  Block,
  Button,
  DomProxy,
  TextBox,
}

export default {
  get: key => allClasses[key.slice(1)]
}
