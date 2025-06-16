export default class PrimaryDispatcher {
  #emitter = null;

  //____________
  // public properties will be freezed!!!
  constructor({ GLOBAL }) {
    this.DEBUG = false;
    this.EVENT_BUS = GLOBAL.EVENT_BUS;
  }

  // _setRequestedData(message, receiverId, requestedData) {
  // }

  _setupConection(emitter) {
    this.#emitter = emitter;
    this.#emitter.updateContextWatchedNames([
      {
        $name: "ctx$fullscreen-opened", // PENDING CHANGE "-" TO "_"
        required: "[]",
      },
      {
        $name: "ctx$fullscreen-closed", // PENDING!
        required: "[]",
      },
      {
        $name: "ctx$resizing-native", // PENDING!
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-normal", // PENDING!
        required: "['ctx$is-activator', 'ctx$is-visual']",
      },
      {
        $name: "ctx$resizing-soft-debounced", // PENDING!
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-hard-debounced", // PENDING!
        required: "['ctx$is-activator']",
      },
      {
        $name: "ctx$resizing-activator-debounced", // PENDING!
        required: "['ctx$is-activator', 'ctx$is-visual']",
      },
    ]);

    this.#emitter.updateGesturesWatchedNames([
      {
        $semantic_name: "$gesture_started",
        required: "[]",
      },
      {
        $semantic_name: "$gesture_cancelled",
        required: "[]",
      },
      {
        $semantic_name: "$tapped",
        required: "[$is-active, $cnv-x, $cnv-y]",
      },
    ], false);
  }

  emitterInputTest(_memo, _state){
    console.log("FROM DISPATCHER!!!!\n@> type:", _memo?.event?.type, "\n#> memo:", _memo ,"\n*> state:", _state ,"\n")
    if (_state.$data.get("$semantic_name") === "$gesture_started") {
      this.#emitter.updateGesturesActiveNames(["$gesture_started"]);
    }
    else if (_state.$data.get("$semantic_name") === "$tapped") {
      this.#emitter.updateGesturesActiveNames([]);
    }
    this.EVENT_BUS._emitOnPrimaryChannel(_state.$data);
  }

  emitterInput(_e, _state){
    console.log("FROM DISPATCHER!!!!\n@> name:", _e.$data.get("$name"), "\n#> data:", _e.$data ,"\n*> state:", _state ,"\n")
  }
}