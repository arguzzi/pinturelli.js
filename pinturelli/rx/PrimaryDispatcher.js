export default class PrimaryDispatcher {
  #EMITTER;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL) {
    this.DEBUG = GLOBAL.CONFIG.DEBUG;
    this.EVENT_BUS = GLOBAL.EVENT_BUS;
    this.#EMITTER = null;
  }

  setupConection({ EMITTER }) {
    this.#EMITTER = EMITTER;
    this.#EMITTER.updateContextWatchedNames([
      {
        $name: "ctx$fullscreen-opened",
        required: "",
      },
      {
        $name: "ctx$fullscreen-closed",
        required: "",
      },
      {
        $name: "ctx$resizing-native",
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-normal",
        required: "['ctx$is-activator', 'ctx$is-visual']",
      },
      {
        $name: "ctx$resizing-soft-debounced",
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-hard-debounced",
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-activator-debounced",
        required: "['ctx$is-activator', 'ctx$is-visual']",
      },
    ]);
  }

  emitterInput(_e, _state){
    console.log("FROM DISPATCHER!!!!\n@> name:", _e.$data.get("$name"), "\n#> data:", _e.$data ,"\n*> state:", _state ,"\n")
  }
}