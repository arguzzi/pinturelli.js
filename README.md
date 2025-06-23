<br id="readme">

# Pinturelli v0.2.1 <br>by Giorgio Arguzzi

#### A library for&nbsp;painting declarative&nbsp;UI on&nbsp;the&nbsp;HTML&nbsp;canvas<br>No&nbsp;frameworks,&nbsp;no&nbsp;servers. Just&nbsp;[q5](#about-q5.js)&nbsp;instances and&nbsp;vanilla&nbsp;JavaScript<br>


<details open>
<summary>
<h2>Presentation</h2>
</summary>

Hello. My&nbsp;name is&nbsp;Giorgio&nbsp;Arguzzi, but&nbsp;everybody&nbsp;calls&nbsp;me&nbsp;[Giorgio](https://arguzzi.github.io). Pinturelli&nbsp;started&nbsp;from the&nbsp;creative&nbsp;spirit&nbsp;of&nbsp;Processing, and then stumbled into&nbsp;something&nbsp;else: React's&nbsp;superpower&nbsp;to&nbsp;organize, compose&nbsp;and&nbsp;scale. Result: imagine&nbsp;`draw()` falling&nbsp;for&nbsp;`useEffect()`, *con&nbsp;amore*.

Loosely based on the Actor Model and Smalltalk’s message-driven philosophy, Pinturelli treats components as tiny&nbsp;agents exchanging&nbsp;signals —no&nbsp;props, no&nbsp;rigid&nbsp;hierarchies. The&nbsp;goal is to build&nbsp;a&nbsp;system that&nbsp;feels&nbsp;flexible, reusable, and&nbsp;functionally&nbsp;alive. The&nbsp;architecture&nbsp;behind&nbsp;it is&nbsp;a&nbsp;*tutti&nbsp;frutti* of&nbsp;ideas, each&nbsp;one hand-picked&nbsp;to&nbsp;fit.

Everything is encapsulated inside a tree: the canvas element at the root, dynamic nodes with independent states, a touch-gesture parser and dispatcher, an event bus for decoupled messages, time-controlled reactions and animations, a query‑selector specific language, etc. You can manipulate both the internal logic and the external container of the tree, from motion and graphics, to layout and full DOM-level integration. You can create, clone and destroy trees and nodes at run time. You can easily lazy-load or fetch any&nbsp;resource. And most importantly: you can recycle your&nbsp;sketches, upgrading them from&nbsp;rasterized&nbsp;drawings to kind-of-semantic UI&nbsp;components.

I’m developing this library for fun, a personal playground to rethink user interfaces and the labor of coding. While I aim to (eventually) achieve an API with guaranteed backward compatibility, it’s still an experimental design in constant evolution. Even if I succeed, Pinturelli will never be meant for enterprise environments where safety, predictability and exponential growth are&nbsp;critical. If&nbsp;I&nbsp;had&nbsp;to&nbsp;choose between&nbsp;toy&nbsp;and&nbsp;tool: definitely&nbsp;toy. Playful, versatile&nbsp;and&nbsp;sometimes unexpectedly&nbsp;useful.

Released into the&nbsp;public&nbsp;domain<br>
CC0 1.0 Universal<br>
on June 21st, 2025
</details>

<details>
<summary>
<h2>API: Learning stage</h2>
</summary>

### *DevTools*

- api errors
- checkpoints
- final mode

### *Registry API*

- pinturelliRoot
- pinturelliNode
- pinturelliClone

### *Root API*

- root info
  - custom id
  - container
  - resolution
  - frame rate
- root assets
  - declaration
- sketch setup
  - ignored

### *Node API*

- node info
  - root id
  - node id
  - UiClass
- state
  - declaration
  - state output
  - `00` followingId
  - `01` labels
  - `02` left
  - `04` top
  - `06` width
  - `07` height
  - `11` nodeLayer
  - `14` nodeVisibility
  - `17` painting
- paintings
  - declaration
  - arguments

### *Reaction API*

- listen
  - primary system
  - event bus
- channels
  - primary channel
  - single node channel
- first config
  - data properties
  - primary request
- reaction
  - config: start at
  - config: default time
  - update: snapshots
  - update: sequences
  - update: return value
  - relays: new message

### *Managers*

- state manager
  - get
  - set
  - output
- data manager
  - get
- q5 manager
  - q5 instance
  - getRootAsset
- node manager
  - q5 createGraphics
- animation manager
  - get
</details>

<details>
<summary>
<h2>API: Advanced stage</h2>
</summary>

### *Dev Tools*

- api errors
- checkpoints
- final mode
- **nodes tracker**
- **events tracker**
- **memory tracker**
- **window polution**
- **pinturelliConfig**

### *Query-selector DSL*

- **origin**
- **group**
- **filter**

### *Registry API*

- pinturelliRoot
- pinturelliNode
- pinturelliClone
- **pinturelliCloneAll**
- **pinturelliRiskySelect**
- **pinturelliRiskySelectAll**
- **pinturelliRiskyDestroy**
- **pinturelliRiskyDestroyAll**

### *Root API*

- root info
  - custom id
  - container
  - resolution
  - **proportion**
  - **no-alpha mode**
  - **pixelated mode**
  - frame rate
  - **trackers**
- root assets
  - declaration
  - **lazy loading**
- sketch setup
  - ignored
- **decoupled tree**
  - **seeds and nodes**
  - **fake state**
  - **cleaning ids**

### *Node API*

- node info
  - root id
  - node id
  - UiClass
  - **UiGestures**
- **node assets**
  - **declaration**
  - **lazy loading**
  - **deleting**
- state
  - declaration
  - state output
  - **pseudo css units**
  - **subtree cascade**
  - `00` followingId
  - `01` labels
  - `02` left
  - **`03` right**
  - `04` top
  - **`05` bottom**
  - `06` width
  - `07` height
  - **`08` proportion**
  - **`09` offsetX**
  - **`10` offsetY**
  - `11` nodeLayer
  - **`12` treeLayer**
  - **`13` insideLayer**
  - `14` nodeVisibility
  - **`15` treeVisibility**
  - **`16` layerVisibility**
  - `17` painting
  - **`18` overlayedPainting**
  - **`19` storeBuffer**
  - **`20` centerMatrix**
- paintings
  - declaration
  - arguments
  - **painter**
  - **layer**
  - **buffer**
  - **matrix**

### *Reaction API*

- listen
  - primary system
  - event bus
  - **listen group**
  - **stop listening**
  - **stop listening group**
- channels
  - primary channel
  - single node channel
  - **common channels**
  - **this window scope**
  - **cross window scope**
- first config
  - data properties
  - primary request
  - **propagation**
  - **bubbling**
- **first middleware**
  - **early return**
  - **data mutation**
  - **collect all primary requests**
- reaction
  - config: start at
  - **config: risky repeat**
  - config: default time
  - **config: bezier time**
  - **config: steps time**
  - **middlewares: validation**
  - **middlewares: mutation**
  - **middlewares: return value**
  - update: snapshots
  - update: animations
  - **update: last update**
  - update: return value
  - relays: new message
  - **relays: relay at**

### *Managers*

- state manager
  - get
  - **getByKeys**
  - **getComplete**
  - **riskyPatch**
  - **riskyPatchByObject**
  - set
  - **setByObject**
  - output
- data manager
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - **riskyRelay**
- q5 manager
  - q5 instance
  - getRootAsset
  - **loadRootAsset**
- node manager
  - q5 createGraphics
  - **buffered painting**
  - **getNodeAsset**
  - **loadNodeAsset**
  - **deleteNodeAsset**
- animation manager
  - get
  - **riskyPatch**
</details>

<details>
<summary>
<h2>Cheat sheet: Query-selector DSL</h2>
</summary>

| Prefix   | Suffix: origin selector                |
|----------|----------------------------------------|
| `_`      | root id (camelCase by convention)<small><br>* custom id cannot start with `_root_`</small>       |
| `#`      | node id (camelCase by convention)<small><br>* custom id cannot end with `-clone_`</small>      |

| Prefix   | Without suffix: group selector         |
|----------|----------------------------------------|
| `>`      | followers of this node                 |
| `<`      | followed by this node                  |
| `~`      | equals (followers of followed node)    |
| `*`      | subtree (all followers, recursively)   |

| Prefix   | Suffix: filter selector                |
|----------|----------------------------------------|
| `.`      | label (always in kebab-case)           |
| `/`      | ui class (always in PascalCase)        |
| `%`      | ui gesture (always in UPPER_CASE)      |

| Prefix   | Suffix: event bus keys                 |
|----------|----------------------------------------|
| `$`      | primary event (always in snake_case)   |
| `$`      | primary channel (without suffix)       |
| `#`      | single node channel (suffix: node id)  |
| `@`      | common channels (no convention)<small><br>* scopes: `tree`, `thisWindow` or `crossWindow`</small>       |

> **all suffixes:**
<br>* must start with a letter.
<br>* they may include digits, hyphens (`-`) and underscores (`_`).
<br>* whitespace and other special characters are not allowed.
</details>

<details>
<summary>
<h2>Cheat sheet: Data and State output</h2>
</summary>

| Data             | Expansions  | Type      |
|------------------|-------------|-----------|
| `$inertia_ratio` | `!INR`      | *number*  |
| `$is_pressed`    | `!ISP`      | *boolean* |
| `$is_validated`  | `!ISV`      | *boolean* |
| `$matrix_x`      | `!MX`       | *number*  |
| `$matrix_y`      | `!MY`       | *number*  |
| `$native_event`  | `!NE`       | *object*  |
| `$vel_z`         | `!VX`       | *number*  |
| `$vel_y`         | `!VY`       | *number*  |
| `$canvas_x`      | `!X` `!XX`  | *number*  |
| `$canvas_y`      | `!Y` `!YY`  | *number*  |

> **not all data properties have an expansion,<br>only the most common ones do**
<br>* see the <a href="#">reference</a> for details.

<br>

| State output | Expansions   | Type      |
|--------------|--------------|-----------|
| `LEFT`       | `!L` `!LE`   | *number*  |
| `RIGHT`      | `!R` `!RI`   | *number*  |
| `TOP`        | `!T` `!TO`   | *number*  |
| `BOTTOM`     | `!B` `!BO`   | *number*  |
| `WIDTH`      | `!W` `!WI`   | *number*  |
| `HEIGHT`     | `!H` `!HE`   | *number*  |
| `PROPORTION` | `!PRP`       | *number*  |
| `OFFSET_X`   | `!OFX`       | *number*  |
| `OFFSET_Y`   | `!OFY`       | *number*  |
| `ORIGIN_X`   | `!ORX`       | *number*  |
| `ORIGIN_Y`   | `!ORY`       | *number*  |
| `CENTER_X`   | `!CX`        | *number*  |
| `CENTER_Y`   | `!CY`        | *number*  |
| `Z_LAYER`    | `!Z` `!ZL`   | *number*  |
| `VISIBILITY` | `!V` `!VI`   | *boolean* |
| `BUFFERED`   | `!BUF`       | *boolean* |
| `CENTERED`   | `!C` `!CEN`  | *boolean* |

> **all state outputs have at least one expansion,<br>but not all states produce outputs**
<br>* see the <a href="#">reference</a> for details.
</details>

<details>
<summary>
<h2>Cheat sheet: Symbol expansions</h2>
</summary>

| Symbol  | Meaning         | Context        |
|---------|-----------------|----------------|
| `!A`    | animation       | Manager     <~ |
| `!AN`   | animation       | Manager     <~ |
|         |                 |                |
| `!B`    | BOTTOM          | state          |
| `!BO`   | BOTTOM          | state          |
| `!BUF`  | BUFFERED        | state          |
|         |                 |                |
| `!C`    | CENTERED        | state          |
| `!CEN`  | CENTERED        | state          |
| `!CX`   | CENTER_X        | state          |
| `!CY`   | CENTER_Y        | state          |
|         |                 |                |
| `!D`    | data            | Manager     <~ |
| `!DA`   | data            | Manager     <~ |
|         |                 |                |
| `!E`    | easy            | animation.time |
| `!EA`   | easy            | animation.time |
| `!EI`   | easyIn          | animation.time |
| `!EIO`  | easyInOut       | animation.time |
| `!EO`   | easyOut         | animation.time |
|         |                 |                |
| `!F`    | animFrame       | animation.time |
| `!FR`   | animFrame       | animation.time |
|         |                 |                |
| `!H`    | HEIGHT          | state          |
| `!HE`   | HEIGHT          | state          |
|         |                 |                |
| `!I`    | q5/instance     | Manager     <~ |
| `!IN`   | q5/instance     | Manager     <~ |
| `!INR`  | $inertia_ratio  | data           |
| `!ISP`	| $is_pressed     | data           |
| `!ISV`  | $is_validated   | data           |
|         |                 |                |
| `!L` 	  | LEFT            | state          |
| `!LE`	  | LEFT            | state          |
|         |                 |                |
| `!M`    | ms/millisecond  | animation.time |
| `!MS`   | ms/millisecond  | animation.time |
| `!MX`   | $matrix_x       | data           |
| `!MY`   | $matrix_y	      | data           |
|         |                 |                |
| `!N`	  | node        	  | Manager     <~ |
| `!NO`	  | node        	  | Manager     <~ |
| `!NE`	  | $native_event	  | data           |
| `!NFR`  | nodeFrame       | animation.time |
|         |                 |                |
| `!OFX`  | OFFSET_X        | state          |
| `!OFY`  | OFFSET_Y        | state          |
| `!ORX`  | ORIGIN_X        | state          |
| `!ORY`  | ORIGIN_Y        | state          |
|         |                 |                |
| `!P`    | percent         | animation.time |
| `!PCT`  | percent         | animation.time |
| `!PRP`  | PROPORTION      | state          |
|         |                 |                |
| `!Q`    | q5/instance     | Manager     <~ |
| `!Q5`   | q5/instance     | Manager     <~ |
|         |                 |                |
| `!R`	  | RIGHT           | state          |
| `!RI`	  | RIGHT           | state          |
|         |                 |                |
| `!S`    | state		        | Manager     <~ |
| `!ST`   | state		        | Manager     <~ |
|         |                 |                |
| `!T`    | TOP             | state          |
| `!TO`   | TOP             | state          |
|         |                 |                |
| `!V`    | VISIBILITY      | state          |
| `!VI`   | VISIBILITY      | state          |
| `!VX`   | $vel_z		      | data           |
| `!VY`	  | $vel_y		      | data           |
|         |                 |                |
| `!W`	  | WIDTH           | state          |
| `!WI`	  | WIDTH           | state          |
|         |                 |                |
| `!X`	  | $canvas_x       | data           |
| `!XX`	  | $canvas_x       | data           |
|         |                 |                |
| `!Y`    | $canvas_y       | data           |
| `!YY`   | $canvas_y       | data           |
|         |                 |                |
| `!Z`    | Z_LAYER         | state          |
| `!ZL`   | Z_LAYER         | state          |
</details>

<br id="about-q5.js">

***

### About q5.js (Pinturelli’s only dependency)

Repository: [https://github.com/q5js/q5.js](https://github.com/q5js/q5.js)

Landing page: [https://q5js.org/home/](https://q5js.org/home/)

It’s a project that *"aims to continue the legacy of the incredible work done by Ben Fry and Casey Reas on Java Processing, Lauren McCarthy's work on p5.js, and all contributors to these projects."*

*"The original q5xjs (v0) was created by @LingDong~ and released under the public domain Unlicense license."*

*"q5.js is open source under the [LGPLv3](https://github.com/q5js/q5.js/blob/main/LICENSE.md), created and actively maintained by @quinton-ashley. The q5 team includes contributor @Tezumie."*

<br>

***

### About Giorgio Arguzzi

[More info here](https://arguzzi.github.io)

I am UX designer in @gucci
 
I am UX designer in @gucci
 
I am UX designer in @gucci
 
I am UX designer in @gucci
 
I am UX designer in @gucci
 
I am UX designer in @gucci
 
I am UX designer in @gucci
 
<br>