export default class PrimaryDispatcher {
  #EMITTER;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL) {
    this.DEBUG = false;
    this.EVENT_BUS = GLOBAL.EVENT_BUS;
    this.#EMITTER = null;
  }

  // _setRequestedData(message, receiverId, requestedData) {
  // }

  _setupConection({ EMITTER }) {
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
        $event_name: "$gesture_started",
        required: "[]",
      },
      {
        $event_name: "$gesture_cancelled",
        required: "[]",
      },
      {
        $event_name: "$tapped",
        required: "[$is-active, $cnv-x, $cnv-y]",
      },
    ], false);
  }

  emitterInputTest(_memo, _state){
    console.log("FROM DISPATCHER!!!!\n@> type:", _memo?.event?.type, "\n#> memo:", _memo ,"\n*> state:", _state ,"\n")
    if (_state.$data.get("$event_name") === "$gesture_started") {
      this.#EMITTER.updateGesturesActiveNames(["$gesture_started"]);
    }
    else if (_state.$data.get("$event_name") === "$tapped") {
      this.#EMITTER.updateGesturesActiveNames([]);
    }
    this.EVENT_BUS._primaryDispatcherSpeak(_state.$data);
  }

  emitterInput(_e, _state){
    console.log("FROM DISPATCHER!!!!\n@> name:", _e.$data.get("$name"), "\n#> data:", _e.$data ,"\n*> state:", _state ,"\n")
  }
}