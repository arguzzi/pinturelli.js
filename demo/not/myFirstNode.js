const myFirstNode = pinturelliNode({
	nodeId: "#myFirstNode",
  rootId: "_myFirstRoot",
  UiClass: "/Block",
  UiGestures: ["%TAP"],

	state: {
    width: "100%",
    height: "100%",
    node_layer: 1,
    painting: "myFirstPainting",
  },

	paintings: {
    myFirstPainting: (q, b, s, d, t) => {
      b.image(b.getAsset("touch"), 0, 0, b.width, b.heigth);
			b.image(b.getAsset("video"), d.canvasX, d.canvasY);
    },
	}
});
