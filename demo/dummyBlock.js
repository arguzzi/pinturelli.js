const dummyBlock = pinturelliNode({
  rootId: "_dummyRoot",
  nodeId: "#dummyBlock",
  PEPEseed: "HOLA",

  state: {
    painting: "firstPaintingEver"
  },

  paintings: {
    firstPaintingEver: ({ q5 }) => {
      q5.background(q5.frameCount % 100, 10, 100);
      q5.fill(100, 10, 0);
      q5.circle(q5.halfWidth, q5.halfHeight, q5.halfWidth / 2);
    }
  }
});

console.warn("DUMMY1", dummyBlock.listened.length, dummyBlock);
dummyBlock.listen("$", "$tapped", {
  reaction: {
    config: {
      duration: 25000,
    },
  update: () => true,
}
});
console.warn("DUMMY2", dummyBlock.listened.length, dummyBlock);