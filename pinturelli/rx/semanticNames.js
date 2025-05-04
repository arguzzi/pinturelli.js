/*
  UiGestures:
  -> _00_block
  -> _01_tap
  -> _02_hold
  -> _03_drag
  -> _04_scroll
  -> _05_swipe
  -> _06_throw
  -> _07_multi_tap
  -> _08_multi_hold
  -> _09_multi_transform_pan
  -> _10_multi_transform_zoom
  -> _11_multi_transform_rotation
  -> _12_multi_transform_all
  -> _13_multi_swipe

  root drivers:
  -> _14_navigation
  -> _15_context
*/

export default Object.freeze({
  singlePointGestures: Object.freeze({
    STATIC: Object.freeze([ // data: $event_name $canvas_x $canvas_y
      
      // all gestures
      "$gesture_started",
      "$gesture_cancelled", // +data: $cancelled_names
      
      // tap
      "$tapped",
      "$tapped_double",
      "$tapped_sequence", // +data: $tap_number

      // hold
      "$holding_started",
      "$holding_validated",
      "$holding_cancelled",
      "$holding_ended",
      "$holding_double_tapped_started",
      "$holding_double_tapped_validated",
      "$holding_double_tapped_cancelled",
      "$holding_double_tapped_ended",

      // drag
      "$dragging_started",
      "$dragging_ended",
      "$dragging_double_tapped_started",
      "$dragging_double_tapped_ended",

      // scroll
      "$scrolling_started",
      "$scrolling_press_ended",
      "$scrolling_inertia_ended",

      // swipe
      "$swiping_started",
      "$swiping_validated",
      "$swiping_cancelled",
      "$swiping_press_ended",
      "$swiping_inertia_ended",

      // throw
      "$throwing_started",
      "$throwing_validated",
      "$throwing_cancelled",
      "$throwing_press_ended",
      "$throwing_inertia_ended",
    ]),

    DYNAMIC: Object.freeze([ // data: $event_name $canvas_x $canvas_y

      // hold
      "$holding", // +data: $is_validated $validation_percentage
      "$holding_double_tapped", // +data: $is_validated $validation_percentage

      // drag
      "$dragging", // +data: $vel_x $vel_y
      "$dragging_held", // +data: $vel_x $vel_y
      "$dragging_double_tapped", // +data: $vel_x $vel_y
      "$dragging_double_tapped_held", // +data: $vel_x $vel_y
      
      // scroll
      "$scrolling_x", // +data: $is_pressed $inertia_percentage $vel_x
      "$scrolling_x_held", // +data: $is_pressed $inertia_percentage $vel_x
      "$scrolling_x_double_tapped", // +data: $is_pressed $inertia_percentage $vel_x
      "$scrolling_x_double_tapped_held", // +data: $is_pressed $inertia_percentage $vel_x
      
      "$scrolling_y", // +data: $is_pressed $inertia_percentage $vel_y
      "$scrolling_y_held", // +data: $is_pressed $inertia_percentage $vel_y
      "$scrolling_y_double_tapped", // +data: $is_pressed $inertia_percentage $vel_y
      "$scrolling_y_double_tapped_held", // +data: $is_pressed $inertia_percentage $vel_y

      "$scrolling_n", // +data: $is_pressed $inertia_percentage $vel_x $vel_y // <--scrolling in x and y
      "$scrolling_n_held", // +data: $is_pressed $inertia_percentage $vel_x $vel_y // <--scrolling in x and y
      "$scrolling_n_double_tapped", // +data: $is_pressed $inertia_percentage $vel_x $vel_y // <--scrolling in x and y
      "$scrolling_n_double_tapped_held", // +data: $is_pressed $inertia_percentage $vel_x $vel_y // <--scrolling in x and y

      // swipe
      "$swiping_x", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$swiping_x_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$swiping_x_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$swiping_x_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      
      "$swiping_y", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$swiping_y_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$swiping_y_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$swiping_y_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      
      "$swiping_n", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$swiping_n_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$swiping_n_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$swiping_n_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      
      // throw
      "$throwing_x", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$throwing_x_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$throwing_x_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      "$throwing_x_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x
      
      "$throwing_y", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$throwing_y_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$throwing_y_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      "$throwing_y_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_y
      
      "$throwing_n", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$throwing_n_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$throwing_n_double_tapped", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
      "$throwing_n_double_tapped_held", // +data: $is_pressed $is_validated $validation_percentage $inertia_percentage $vel_x $vel_y
    ]),
  }),

  multiPointGestures: Object.freeze({
    STATIC: Object.freeze([ // data: $event_name $multi_pointers (array of objects, each one with "$event", "$canvas_x" and "$canvas_y" properties) 
      
      // tap (multi fingers)
      "$multi_tapped",
      "$multi_tapped_double",
      "$multi_tapped_sequence", // +data: $multi_tap_number

      // hold (multi fingers)
      "$multi_holding_started",
      "$multi_holding_validated",
      "$multi_holding_cancelled",
      "$multi_holding_ended",
      "$multi_holding_double_tapped_started",
      "$multi_holding_double_tapped_validated",
      "$multi_holding_double_tapped_cancelled",
      "$multi_holding_double_tapped_ended",

      // transform: pan (two fingers) 
      "$multi_transforming_pan_started",
      "$multi_transforming_pan_press_ended",
      "$multi_transforming_pan_inertia_ended",

      // transform: zoom in/out, aka pinch (two fingers)
      "$multi_transforming_zoom_started",
      "$multi_transforming_zoom_press_ended",
      "$multi_transforming_zoom_inertia_ended",

      // transform: rotation (two fingers)
      "$multi_transforming_rotation_started",
      "$multi_transforming_rotation_press_ended",
      "$multi_transforming_rotation_inertia_ended",

      // transform: all (two fingers) <--panning + zooming + rotating
      "$multi_transforming_all_started",
      "$multi_transforming_all_press_ended",
      "$multi_transforming_all_inertia_ended",

      // swipe (multi fingers)
      "$multi_swiping_started",
      "$multi_swiping_validated",
      "$multi_swiping_cancelled",
      "$multi_swiping_press_ended",
      "$multi_swiping_inertia_ended",
    ]),
    
    DYNAMIC: Object.freeze([ // data: $event_name $multi_pointers (array of objects with "$event", "$canvas_x" and "$canvas_y" properties)
      
      // hold (multi fingers)
      "$multi_holding", // +data: $multi_are_validated $multi_validation_percentage
      "$multi_holding_double_tapped", // +data: $multi_are_validated $multi_validation_percentage

      // transform: pan (two fingers) 
      "$multi_transforming_pan", // +data: $multi_vel_x $multi_vel_y // <--dragging (or scroll in x and y without inertia)
      "$multi_transforming_pan_inertia", // +data: $multi_are_pressed $multi_inertia_percentage $multi_vel_x $multi_vel_y // <--scrolling in x and y
      
      // transform: zoom in/out, aka pinch (two fingers)
      "$multi_transforming_zoom", // +data: $multi_zoom_factor $multi_zoom_vel
      "$multi_transforming_zoom_inertia", // +data: $multi_are_pressed $multi_inertia_percentage $multi_zoom_factor $multi_zoom_vel
      
      // transform: rotation (two fingers)
      "$multi_transforming_rotation", // +data: $multi_rotation_radians $multi_rotation_vel
      "$multi_transforming_rotation_inertia", // +data: $multi_are_pressed $multi_inertia_percentage $multi_rotation_radians $multi_rotation_vel
      
      // transform: all (two fingers) <--panning + zooming + rotating
      "$multi_transforming_all", // +data: $multi_zoom_factor $multi_rotation_radians $multi_zoom_vel $multi_rotation_vel $multi_vel_x $multi_vel_y
      "$multi_transforming_all_inertia", // +data: $multi_are_pressed $multi_inertia_percentage $multi_zoom_factor $multi_rotation_radians $multi_zoom_vel $multi_rotation_vel $multi_vel_x $multi_vel_y

      // swipe (multi fingers)
      "$multi_swiping_x", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_x
      "$multi_swiping_x_held", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_x
  
      "$multi_swiping_y", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_y
      "$multi_swiping_y_held", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_y

      "$multi_swiping_n", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_x $multi_vel_y
      "$multi_swiping_n_held", // +data: $multi_are_pressed $multi_are_validated $multi_validation_percentage $multi_inertia_percentage $multi_vel_x $multi_vel_y
    ])
  }),

  navigation: Object.freeze({
    STATIC: Object.freeze([ // data: $event_name $navg_url
      "$navg_assets_loaded", // +data: $navg_time_taken
      "$navg_changed_state",
      "$navg_changed_hash",
    ]), 

    DYNAMIC: Object.freeze([ // data: $event_name
      "$navg_loading_assets", // +data: $navg_actual_time $navg_aprox_total_time $navg_aprox_ratio_time
    ])
  }),

  context: Object.freeze({
    STATIC: Object.freeze([ // data: $event_name
      "$cntx_fullscreen_opened",
      "$cntx_fullscreen_closed",
    ]),

    DYNAMIC: Object.freeze([ // data: $event_name $cntx_is_activator, $cntx_is_visual
      "$cntx_resizing_native",
      "$cntx_resizing_normal",
      "$cntx_resizing_soft_debounced",
      "$cntx_resizing_hard_debounced",
      "$cntx_resizing_activator_debounced",
    ])
  })
})