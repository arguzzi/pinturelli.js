/*
  gesture mixins:
  -> tappable
  -> holdable
  -> draggable
  -> scrollable
  -> swipable
  -> throwable
  -> transformable ($_$)
*/

export default Object.freeze({
  singlePointGestures: Object.freeze({
    STATIC: Object.freeze([ // data: $is-active $exit-code $cnv-x $cnv-y
      //______
      // all gestures
      "$gesture-started",
      "$gesture-cancelled",
      
      //______
      // tap
      "$tapped",
      "$tapped-double",
      "$tapped-sequence", // +data: $tap-number

      //______
      // hold
      "$holding-started",
      "$holding-ended",
      "$holding-double-tapped-started",
      "$holding-double-tapped-ended",

      //______
      // drag
      "$dragging-started",
      "$dragging-ended",
      "$dragging-double-tapped-started",
      "$dragging-double-tapped-ended",

      //______
      // scroll
      "$scrolling-started",
      "$scrolling-press-ended",
      "$scrolling-inertia-ended",

      //______
      // swipe
      "$swiping-started",
      "$swiping-validated",
      "$swiping-cancelled",
      "$swiping-press-ended",
      "$swiping-inertia-ended",

      //______
      // throw
      "$throwing-started",
      "$throwing-validated",
      "$throwing-cancelled",
      "$throwing-press-ended",
      "$throwing-inertia-ended",
    ]),

    DYNAMIC: Object.freeze([ // data: $is-active $exit-code $cnv-x $cnv-y
      //______
      // hold
      "$holding",
      "$holding-double-tapped",

      //______
      // drag
      "$dragging", // +data: $vel-x $vel-y
      "$dragging-double-tapped", // +data: $vel-x $vel-y
      
      //______
      // scroll
      "$scrolling-x", // +data: $is-pressed $inertia-percentage $vel-x
      "$scrolling-x-held", // +data: $is-pressed $inertia-percentage $vel-x
      "$scrolling-x-double-tapped", // +data: $is-pressed $inertia-percentage $vel-x
      "$scrolling-x-double-tapped-held", // +data: $is-pressed $inertia-percentage $vel-x
      
      "$scrolling-y", // +data: $is-pressed $inertia-percentage $vel-y
      "$scrolling-y-held", // +data: $is-pressed $inertia-percentage $vel-y
      "$scrolling-y-double-tapped", // +data: $is-pressed $inertia-percentage $vel-y
      "$scrolling-y-double-tapped-held", // +data: $is-pressed $inertia-percentage $vel-y

      "$scrolling-n", // +data: $is-pressed $inertia-percentage $vel-x $vel-y // <--scrolling in x and y
      "$scrolling-n-held", // +data: $is-pressed $inertia-percentage $vel-x $vel-y // <--scrolling in x and y
      "$scrolling-n-double-tapped", // +data: $is-pressed $inertia-percentage $vel-x $vel-y // <--scrolling in x and y
      "$scrolling-n-double-tapped-held", // +data: $is-pressed $inertia-percentage $vel-x $vel-y // <--scrolling in x and y

      //______
      // swipe
      "$swiping-x", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$swiping-x-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$swiping-x-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$swiping-x-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      
      "$swiping-y", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$swiping-y-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$swiping-y-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$swiping-y-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      
      "$swiping-n", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$swiping-n-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$swiping-n-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$swiping-n-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      
      //______
      // throw
      "$throwing-x", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$throwing-x-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$throwing-x-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      "$throwing-x-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x
      
      "$throwing-y", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$throwing-y-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$throwing-y-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      "$throwing-y-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-y
      
      "$throwing-n", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$throwing-n-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$throwing-n-double-tapped", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
      "$throwing-n-double-tapped-held", // +data: $is-pressed $is-validated $validation-percentage $inertia-percentage $vel-x $vel-y
    ]),
  }),

  multiPointGestures: Object.freeze({ // data: $-$pointers (array of objects, each one with "$is-active", "$exit-code", "$cnv-x" and "$cnv-y" properties) 
    STATIC: Object.freeze([
      //______
      // tap (multi fingers)
      "$-$tapped",
      "$-$tapped-double",
      "$-$tapped-sequence", // +data: $-$tap-number

      //______
      // hold (multi fingers)
      "$-$holding-started",
      "$-$holding-ended",
      "$-$holding-double-tapped-started",
      "$-$holding-double-tapped-ended",

      //______
      // transform (two fingers)
      "$-$transforming-pan-started",
      "$-$transforming-pan-press-ended",
      "$-$transforming-pan-inertia-ended",

      "$-$transforming-zoom-started",
      "$-$transforming-zoom-press-ended",
      "$-$transforming-zoom-inertia-ended",

      "$-$transforming-rotation-started",
      "$-$transforming-rotation-press-ended",
      "$-$transforming-rotation-inertia-ended",

      "$-$transforming-all-started",
      "$-$transforming-all-press-ended",
      "$-$transforming-all-inertia-ended",

      //______
      // swipe (multi fingers)
      "$-$swiping-started",
      "$-$swiping-validated",
      "$-$swiping-cancelled",
      "$-$swiping-press-ended",
      "$-$swiping-inertia-ended",
    ]),
    
    DYNAMIC: Object.freeze([ // data: $-$pointers (array of objects with "$is-active", "$exit-code", "$cnv-x" and "$cnv-y" properties)
      //______
      // hold (multi fingers)
      "$-$holding",
      "$-$holding-double-tapped",

      //______
      // transform: pan (two fingers) 
      "$-$transforming-pan", // +data: $-$vel-x $-$vel-y // <--dragging (or scroll in x and y without inertia)
      "$-$transforming-pan-inertia", // +data: $-$are-pressed $-$inertia-percentage $-$vel-x $-$vel-y // <--scrolling in x and y
      
      // transform: zoom in/out aka pinch (two fingers)
      "$-$transforming-zoom", // +data: $-$zoom-factor $-$zoom-vel
      "$-$transforming-zoom-inertia", // +data: $-$are-pressed $-$inertia-percentage $-$zoom-factor $-$zoom-vel
      
      // transform: rotate (two fingers)
      "$-$transforming-rotation", // +data: $-$rotation-radians $-$rotation-vel
      "$-$transforming-rotation-inertia", // +data: $-$are-pressed $-$inertia-percentage $-$rotation-radians $-$rotation-vel
      
      // transform: all (two fingers) <--panning + zoomimg + rotating
      "$-$transforming-all", // +data: $-$zoom-factor $-$rotation-radians $-$zoom-vel $-$rotation-vel $-$vel-x $-$vel-y
      "$-$transforming-all-inertia", // +data: $-$are-pressed $-$inertia-percentage $-$zoom-factor $-$rotation-radians $-$zoom-vel $-$rotation-vel $-$vel-x $-$vel-y

      //______
      // swipe (multi fingers)
      "$-$swiping-x", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-x
      "$-$swiping-x-held", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-x
  
      "$-$swiping-y", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-y
      "$-$swiping-y-held", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-y

      "$-$swiping-n", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-x $-$vel-y
      "$-$swiping-n-held", // +data: $-$are-pressed $-$are-validated $-$validation-percentage $-$inertia-percentage $-$vel-x $-$vel-y
    ])
  }),

  navigation: Object.freeze({ // data: nav$url
    STATIC: Object.freeze([
      "nav$changed-state", 
      "nav$changed-hash",
    ])
  }),

  context: Object.freeze({ // no extra data
    STATIC: Object.freeze([
      "ctx$fullscreen-opened",
      "ctx$fullscreen-closed",
    ]),

    DYNAMIC: Object.freeze([ // data: ctx$is-activator, ctx$is-visual
      "ctx$resizing-native",
      "ctx$resizing-normal",
      "ctx$resizing-soft-debounced",
      "ctx$resizing-hard-debounced",
      "ctx$resizing-activator-debounced",
    ])
  })
})