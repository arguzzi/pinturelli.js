<table id="readme" width="540" align="center" style="max-with: 540px;">
<tr><td>

# Pinturelli v0.2.1 <br>by Giorgio Arguzzi

#### A library for&nbsp;painting declarative&nbsp;UI on&nbsp;the&nbsp;HTML&nbsp;canvas<br>No&nbsp;frameworks,&nbsp;no&nbsp;servers. Just&nbsp;[q5](#about-q5.js)&nbsp;instances and&nbsp;vanilla&nbsp;JavaScript<br>


<details open>
<summary>
<h2>Presentation</h2>
</summary>

Hello. My&nbsp;name is&nbsp;Giorgio&nbsp;Arguzzi, but&nbsp;everybody&nbsp;calls&nbsp;me&nbsp;[Giorgio](https://arguzzi.github.io). Pinturelli&nbsp;started&nbsp;from the&nbsp;creative&nbsp;spirit&nbsp;of&nbsp;Processing, and then stumbled into&nbsp;something&nbsp;else: React's&nbsp;superpower&nbsp;to&nbsp;organize, compose&nbsp;and&nbsp;scale. Result: imagine&nbsp;`draw()` falling&nbsp;for&nbsp;`useEffect()`, *con&nbsp;amore*.

Loosely based on the Actor Model and Smalltalk’s message-driven philosophy, Pinturelli treats components as tiny&nbsp;agents exchanging&nbsp;signals —no&nbsp;props, no&nbsp;rigid&nbsp;hierarchies. The&nbsp;goal is to build&nbsp;a&nbsp;system that&nbsp;feels&nbsp;flexible, reusable, and&nbsp;functionally&nbsp;alive. The&nbsp;architecture&nbsp;behind&nbsp;it is&nbsp;a&nbsp;*tutti&nbsp;frutti* of&nbsp;ideas, each&nbsp;one hand-picked&nbsp;to&nbsp;fit.

Everything is encapsulated inside a tree: the canvas element at the root, dynamic nodes with independent states, a touch-gesture parser and dispatcher, an event bus for decoupled messages, time managers for asynchronous reactions, a compact node‑query language, etc. You can manipulate both the internal logic and the external container of the tree, from motion and graphics, to layout and full DOM-level integration. You can create, clone and destroy trees and nodes at run time. You can easily lazy-load or fetch any&nbsp;resource. And most importantly: you can recycle your&nbsp;sketches, upgrading them from&nbsp;rasterized&nbsp;drawings to kind-of-semantic UI&nbsp;components.

I’m developing this library for fun, a personal playground to rethink user interfaces and the labor of coding. While I aim to (eventually) achieve an API with guaranteed backward compatibility, it’s still an experimental design in constant evolution. Even if I succeed, Pinturelli will never be meant for enterprise environments where safety, predictability and exponential growth are&nbsp;critical. If&nbsp;I&nbsp;had&nbsp;to&nbsp;choose between&nbsp;toy&nbsp;and&nbsp;tool: definitely&nbsp;toy. Playful, versatile&nbsp;and&nbsp;sometimes unexpectedly&nbsp;useful.

Released into the&nbsp;public&nbsp;domain<br>
CC0 1.0 Universal<br>
on June 21st, 2025
</details>

<details>
<summary>
<h2>Learning stage</h2>
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

- root description
  - custom id
  - container
- global assets
  - declaration
- sketch setup
  - ignored

### *Node API*

- node description
  - node id
  - root id
  - UiClass
- state
  - declaration
  - `00` following
  - `01` labels
  - `02` left
  - `04` top
  - `06` width
  - `07` height
  - `11` nodeLayer
  - `14` nodeVisibility
  - `17` nodePermanency
  - `20` painting
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
- reaction object
  - config
  - update
  - relays
- reaction config
  - delayed (startAt)
  - default time
- reaction update
  - snapshots
  - sequences
- buffer manager
  - createGraphics
  - getGlobalAssets
- state manager
  - get
  - set
- data manager
  - get
- time manager
  - get
- reaction relays
  - new message
</details>

<details>
<summary>
<h2>Advanced stage</h2>
</summary>

### *Dev Tools*

- api errors
- checkpoints
- final mode
- **nodes tracker**
- **events tracker**
- **memory tracker**
- **window polution**

### *Selection (DSL)*

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

- root description
  - custom id
  - container
- **decoupled tree**
  - **seeds**
  - **nodes**
  - **fake state**
- global assets
  - declaration
  - **lazy loading**
- sketch setup
  - ignored

### *Node API*

- node description
  - node id
  - root id
  - UiClass
  - **UiGestures**
- state
  - declaration
  - **pseudo css units**
  - `00` following
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
  - `17` nodePermanency
  - **`18` treePermanency**
  - **`19` layerPermanency**
  - `20` painting
  - **`21` overlayed painting**
- **local assets**
  - **declaration**
  - **lazy loading**
- paintings
  - declaration
  - arguments
  - **painter**

### *Reaction API*

- listen
  - primary system
  - event bus
- **stopListening**
- channels
  - primary channel
  - single node channel
  - **public channels**
- first config
  - data properties
  - primary request
  - **data mutation**
  - **propagation**
  - **bubbling**
- **first middlewares**
- reaction object
  - config
  - **middlewares**
  - update
  - **last update**
  - relays
- reaction config
  - delayed (startAt)
  - **riskyRepeat**
  - default time
  - **bezier time**
  - **steps time**
- reaction update
  - snapshots
  - sequences
- buffer manager
  - createGraphics
  - **getLocalAssets**
  - getGlobalAssets
  - **loadGlobalAsset**
- state manager
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - set
  - **setByObject**
  - **loadLocalAsset**
  - **deleteLocalAsset**
- data manager
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - **riskyRelay**
- time manager
  - get
  - **riskyPatch**
- reaction relays
  - new message
  - **delayed (relayAt)**
</details>

<details>
<summary>
<h2>Cheat sheet</h2>
</summary>

| Prefix   | Suffix: origin selector                |
|----------|----------------------------------------|
| `_`      | root id (camelCase by convention)      |
| `#`      | node id (camelCase by convention)      |

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
| `@`      | public channels (no convention)        |

<br>

> **all suffixes:**
<br>* must start with a letter.
<br>* they may include digits, hyphens (`-`) and underscores (`_`).
<br>* whitespace and other special characters are not allowed.
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
 
</td></tr>
</table>
