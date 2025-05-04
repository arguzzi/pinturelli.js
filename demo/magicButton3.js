import magicButton from "./magicButton";

const magicButton3 = magicButton.newCopy({
	id: "magicButton3",
	top: null,
	left: 20,
	bottom: 10,
});

magicButton3.handle("$tapped", {
  middlewares: [
    () => true
  ]
});