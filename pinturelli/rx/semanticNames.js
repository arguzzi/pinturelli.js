/*
  node drivers:                       UiGestures:
  -> _00_block.js                     -> %BLOCK
  -> _01_tap.js                       -> %TAP
  -> _02_hold.js                      -> %HOLD
  -> _03_drag.js                      -> %DRAG
  -> _04_scroll.js                    -> %SCROLL
  -> _05_swipe.js                     -> %SWIPE
  -> _06_throw.js                     -> %THROW
  -> _07_multi_tap.js                 -> %MULTI_TAP
  -> _08_multi_hold.js                -> %MULTI_HOLD
  -> _09_multi_transform_pan.js       -> %MULTI_TRANSFORM_PAN
  -> _10_multi_transform_zoom.js      -> %MULTI_TRANSFORM_ZOOM
  -> _11_multi_transform_rotation.js  -> %MULTI_TRANSFORM_ROTATION
  -> _12_multi_transform_all.js       -> %MULTI_TRANSFORM_ALL
  -> _13_multi_swipe.js               -> %MULTI_SWIPE

  root drivers:
  -> _14_navigation.js
  -> _15_context.js
*/

export default structuredClone({
  singlePointGestures: {
    STATIC: {
      always: ["$semantic_name", "$native_event", "$canvas_x", "$canvas_y"],
      
      // all gestures
      "$gesture_started": [],
      "$gesture_cancelled": ["$cancelled_names"],
      
      // tap
      "$tapped": [],
      "$tapped_double": [],
      "$tapped_sequence": ["$tap_number"],

      // hold
      "$holding_started": [],
      "$holding_validated": [],
      "$holding_cancelled": [],
      "$holding_ended": [],
      "$holding_double_tapped_started": [],
      "$holding_double_tapped_validated": [],
      "$holding_double_tapped_cancelled": [],
      "$holding_double_tapped_ended": [],

      // drag
      "$dragging_started": [],
      "$dragging_ended": [],
      "$dragging_double_tapped_started": [],
      "$dragging_double_tapped_ended": [],

      // scroll
      "$scrolling_started": [],
      "$scrolling_press_ended": [],
      "$scrolling_inertia_ended": [],

      // swipe
      "$swiping_started": [],
      "$swiping_validated": [],
      "$swiping_cancelled": [],
      "$swiping_press_ended": [],
      "$swiping_inertia_ended": [],

      // throw
      "$throwing_started": [],
      "$throwing_validated": [],
      "$throwing_cancelled": [],
      "$throwing_press_ended": [],
      "$throwing_inertia_ended": [],
    },

    DYNAMIC: {
      always: ["$semantic_name", "$native_event", "$canvas_x", "$canvas_y"],

      // hold
      "$holding": ["$is_validated", "$validation_ratio"],
      "$holding_double_tapped": ["$is_validated", "$validation_ratio"],

      // drag
      "$dragging": ["$vel_x", "$vel_y"],
      "$dragging_held": ["$vel_x", "$vel_y"],
      "$dragging_double_tapped": ["$vel_x", "$vel_y"],
      "$dragging_double_tapped_held": ["$vel_x", "$vel_y"],
      
      // scroll
      "$scrolling_x": ["$is_pressed", "$inertia_ratio", "$vel_x"],
      "$scrolling_x_held": ["$is_pressed", "$inertia_ratio", "$vel_x"],
      "$scrolling_x_double_tapped": ["$is_pressed", "$inertia_ratio", "$vel_x"],
      "$scrolling_x_double_tapped_held": ["$is_pressed", "$inertia_ratio", "$vel_x"],
      
      "$scrolling_y": ["$is_pressed", "$inertia_ratio", "$vel_y"],
      "$scrolling_y_held": ["$is_pressed", "$inertia_ratio", "$vel_y"],
      "$scrolling_y_double_tapped": ["$is_pressed", "$inertia_ratio", "$vel_y"],
      "$scrolling_y_double_tapped_held": ["$is_pressed", "$inertia_ratio", "$vel_y"],

      "$scrolling_n": ["$is_pressed", "$inertia_ratio", "$vel_x", "$vel_y"], // <--scrolling in x and y
      "$scrolling_n_held": ["$is_pressed", "$inertia_ratio", "$vel_x", "$vel_y"], // <--scrolling in x and y
      "$scrolling_n_double_tapped": ["$is_pressed", "$inertia_ratio", "$vel_x", "$vel_y"], // <--scrolling in x and y
      "$scrolling_n_double_tapped_held": ["$is_pressed", "$inertia_ratio", "$vel_x", "$vel_y"], // <--scrolling in x and y

      // swipe
      "$swiping_x": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$swiping_x_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$swiping_x_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$swiping_x_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      
      "$swiping_y": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$swiping_y_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$swiping_y_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$swiping_y_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      
      "$swiping_n": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$swiping_n_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$swiping_n_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$swiping_n_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      
      // throw
      "$throwing_x": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$throwing_x_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$throwing_x_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      "$throwing_x_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x"],
      
      "$throwing_y": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$throwing_y_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$throwing_y_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      "$throwing_y_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_y"],
      
      "$throwing_n": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$throwing_n_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$throwing_n_double_tapped": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
      "$throwing_n_double_tapped_held": ["$is_pressed", "$is_validated", "$validation_ratio", "$inertia_ratio", "$vel_x", "$vel_y"],
    },
  },

  multiPointGestures: {
    STATIC: {
      always: ["$semantic_name", "$multi_pointers"], // $multi_pointers = array of objects, each one with "$native_event", "$canvas_x" and "$canvas_y" properties
      
      // tap (multi fingers)
      "$multi_tapped": [],
      "$multi_tapped_double": [],
      "$multi_tapped_sequence": ["$multi_tap_number"],

      // hold (multi fingers)
      "$multi_holding_started": [],
      "$multi_holding_validated": [],
      "$multi_holding_cancelled": [],
      "$multi_holding_ended": [],
      "$multi_holding_double_tapped_started": [],
      "$multi_holding_double_tapped_validated": [],
      "$multi_holding_double_tapped_cancelled": [],
      "$multi_holding_double_tapped_ended": [],

      // transform: pan (two fingers) 
      "$multi_transforming_pan_started": [],
      "$multi_transforming_pan_press_ended": [],
      "$multi_transforming_pan_inertia_ended": [],

      // transform: zoom in/out, aka pinch (two fingers)
      "$multi_transforming_zoom_started": [],
      "$multi_transforming_zoom_press_ended": [],
      "$multi_transforming_zoom_inertia_ended": [],

      // transform: rotation (two fingers)
      "$multi_transforming_rotation_started": [],
      "$multi_transforming_rotation_press_ended": [],
      "$multi_transforming_rotation_inertia_ended": [],

      // transform: all (two fingers) <--panning + zooming + rotating
      "$multi_transforming_all_started": [],
      "$multi_transforming_all_press_ended": [],
      "$multi_transforming_all_inertia_ended": [],

      // swipe (multi fingers)
      "$multi_swiping_started": [],
      "$multi_swiping_validated": [],
      "$multi_swiping_cancelled": [],
      "$multi_swiping_press_ended": [],
      "$multi_swiping_inertia_ended": [],
    },
    
    DYNAMIC: {
      always: ["$semantic_name", "$multi_pointers"], // $multi_pointers = array of objects, each one with "$native_event", "$canvas_x" and "$canvas_y" properties
      
      // hold (multi fingers)
      "$multi_holding": ["$multi_are_validated", "$multi_validation_ratio"],
      "$multi_holding_double_tapped": ["$multi_are_validated", "$multi_validation_ratio"],

      // transform: pan (two fingers) 
      "$multi_transforming_pan": ["$multi_vel_x", "$multi_vel_y"], // <--dragging (or scroll in x and y without inertia)
      "$multi_transforming_pan_inertia": ["$multi_are_pressed", "$multi_inertia_ratio", "$multi_vel_x", "$multi_vel_y"], // <--scrolling in x and y
      
      // transform: zoom in/out, aka pinch (two fingers)
      "$multi_transforming_zoom":["$multi_zoom_factor", "$multi_zoom_vel"],
      "$multi_transforming_zoom_inertia": ["$multi_are_pressed", "$multi_inertia_ratio", "$multi_zoom_factor", "$multi_zoom_vel"],
      
      // transform: rotation (two fingers)
      "$multi_transforming_rotation": ["$multi_rotation_radians", "$multi_rotation_vel"],
      "$multi_transforming_rotation_inertia": ["$multi_are_pressed", "$multi_inertia_ratio", "$multi_rotation_radians", "$multi_rotation_vel"],
      
      // transform: all (two fingers) <--panning + zooming + rotating
      "$multi_transforming_all": ["$multi_zoom_factor", "$multi_rotation_radians", "$multi_zoom_vel", "$multi_rotation_vel", "$multi_vel_x", "$multi_vel_y"],
      "$multi_transforming_all_inertia": ["$multi_are_pressed", "$multi_inertia_ratio", "$multi_zoom_factor", "$multi_rotation_radians", "$multi_zoom_vel", "$multi_rotation_vel", "$multi_vel_x", "$multi_vel_y"],

      // swipe (multi fingers)
      "$multi_swiping_x": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_x"],
      "$multi_swiping_x_held": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_x"],
  
      "$multi_swiping_y": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_y"],
      "$multi_swiping_y_held": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_y"],

      "$multi_swiping_n": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_x", "$multi_vel_y"],
      "$multi_swiping_n_held": ["$multi_are_pressed", "$multi_are_validated", "$multi_validation_ratio", "$multi_inertia_ratio", "$multi_vel_x", "$multi_vel_y"],
    }
  },

  navigation: {
    STATIC: {
      always: ["$semantic_name", "$native_event", "$navg_url"],
      "$navg_assets_loaded": ["$navg_time_taken"],
      "$navg_changed_state": [],
      "$navg_changed_hash": [],
    }, 

    DYNAMIC: {
      always: ["$semantic_name", "$native_event"],
      "$navg_loading_assets": ["$navg_actual_time", "$navg_aprox_total_time", "$navg_aprox_ratio_time"],
    }
  },

  context: {
    STATIC: {
      always: ["$semantic_name", "$native_event"],
      "$cntx_fullscreen_opened": [],
      "$cntx_fullscreen_closed": [],
    },

    DYNAMIC: {
      always: ["$semantic_name", "$native_event", "$cntx_is_activator", "$cntx_is_visual"],
      "$cntx_resizing_native": [],
      "$cntx_resizing_normal": [],
      "$cntx_resizing_soft_debounced": [],
      "$cntx_resizing_hard_debounced": [],
      "$cntx_resizing_activator_debounced": [],
    }
  }
})
