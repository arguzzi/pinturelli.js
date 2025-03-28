import createGlobal from "global/global.js";
import Button from "ui/components/Button.js";

const GLOBAL = createGlobal(540, true);

const root = GLOBAL.UI_ROOT;

root.agregarElemento(new Button({w: 30, h:60}));
