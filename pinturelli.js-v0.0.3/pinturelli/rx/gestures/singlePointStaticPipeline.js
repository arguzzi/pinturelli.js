import params from "./gesturesPipelinesParams.js";

////////////////////////////
//
const EXIT_CODE = Object.freeze({
  REJECTED: 0,
  COMPLETED: 1,
  UNKNOWN_EVENT_TYPE: 2,
});






const tapEnded = (_memo, _state) => {

  const $data = new Map([_state.$data]);
  $data.set("$name", "$tapped");
  $data.set("$is-active", false);
  $data.set("$cnv-x", mouseX);
  $data.set("$cnv-y", mouseY);

  _memo._gesturesOutput(_memo, { ..._state, $data });

  return true;
}




export default {
  tapEnded
}


// single point events ($name)

// static flters:
// -> primary-pointer-input, primary-pointer-cancelled
// -> tap, double-tap, secuential-tap, last-tap
// -> tap-holded*, double-tap-holded*

// movement filters:
// -> (holded*), drag, drag-drop, 
// -> (holded*), swipe-up, swipe-down, swipe-x
// -> scroll, scroll-x, scroll-y (inertial)
// -> (holded*) flick-up, flick-down, flick-x (inertial)

//////////////////////////////
//
/*
class PrimaryPipeline {
  #filters;
  #state;

  //____________
  constructor() {
    this._gestures = []; // public access. updated by PrimaryDispatcher
    this.#filters = new Set();
  }

  //____________
  get state() { return this.#state };
  get filters() { return this.#filters };
  _addFilter(filterFn) {
    this.#filters.add(filterFn);
  }

  //____________
  process(_e, filters = this.#filters) {
    let semanticEvent = _e; // $properties -> mutation espected!
    this.#state = { breakProcess: false }; // temporal info

    for (const filter of filters) {
      filter(semanticEvent, this); // mutation here
      if (this.#state.breakProcess) break;
    }

    return semanticEvent; 
  }
}

//////////////////////////////
//
const primaryInputFilter = (e, p) => {
  if (e.type === "pointerdown") {
    
  }
}

//____________

//____________

//____________

//____________

//////////////////////////////
//
const primaryPipeline = PrimaryPipeline();
primaryPipeline._addFilter(primaryPointerInput);
primaryPipeline._addFilter(primaryPointerInput);
primaryPipeline._addFilter(primaryPointerInput);
primaryPipeline._addFilter(primaryPointerInput);

export default primaryPipeline;

// */



// // Filtro que agrega información de "click" si se detecta un pointerdown seguido de pointerup rápido
// function clickFilterFactory() {
//   let active = false;
//   let downTime = 0;
//   return function(event) {
//     if (event.type === 'pointerdown') {
//       active = true;
//       downTime = Date.now();
//       return event;
//     }
//     if (event.type === 'pointerup' && active) {
//       const elapsed = Date.now() - downTime;
//       if (elapsed < 200) {
//         // Se enriquece el evento añadiendo la propiedad "semantic" con valor "click"
//         event.semantic = 'click';
//       }
//       active = false;
//       return event;
//     }
//     return event;
//   };
// }

// export default clickFilterFactory;

