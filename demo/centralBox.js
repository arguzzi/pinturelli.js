
////////////////////////////////////////////
//
const centralBox = pinturelliNode({
  parent: "_root_0",
  id: "centralBox",
  class: "void",

  //_______
  height: 200,
  top: 0,
  left: 0,
  right: 0,
  layer: 1,
});

////////////////////////////////////////////
//
centralBox.listen("magicButton", "hide", {

});

////////////////////////////////////////////
//
export default centralBox;