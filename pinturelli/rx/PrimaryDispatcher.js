export default class PrimaryDispatcher {
  #TARGETS = new Set();
  #EMITTER = null;
  #EVENT_BUS = null;

  //____________
  // public properties will be freezed!!!
  constructor({ EVENT_BUS }) {
    this.#EVENT_BUS = EVENT_BUS;
  }

  //____________
  // _setRequestedData(message, receiverId, requestedData) {
  // }

  //____________
  _handleRequirement(channelId, message, data) {
  }
  
  //____________
  _handleBubbling() {
  }

  //____________
  _setUiConnection(node) {
    this.#TARGETS.add(node);
  }
  
  //____________
  _setRxConnection(EMITTER) {
    this.#EVENT_BUS._setRxConnection(this)
    this.#EMITTER = EMITTER;
    this.#EMITTER.updateContextWatchedNames([
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

    this.#EMITTER.updateGesturesWatchedNames([
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
        required: "[$is-active, $canvas-x, $canvas-y]",
      },
    ], false);
  }

  //____________
  emitterInputTest(_memo, _state){
    console.log("FROM DISPATCHER!!!!\n@> type:", _memo?.event?.type, "\n#> memo:", _memo ,"\n*> state:", _state ,"\n")
    if (_state.$data.get("$semantic_name") === "$gesture_started") {
      this.#EMITTER.updateGesturesActiveNames(["$gesture_started"]);
    }
    else if (_state.$data.get("$semantic_name") === "$tapped") {
      this.#EMITTER.updateGesturesActiveNames([]);
    }
    this.EVENT_BUS._emitOnPrimaryChannel(_state.$data);
  }

  //____________
  emitterInput(_e, _state){
    console.log("FROM DISPATCHER!!!!\n@> name:", _e.$data.get("$name"), "\n#> data:", _e.$data ,"\n*> state:", _state ,"\n")
  }
}