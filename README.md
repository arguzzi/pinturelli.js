# Pinturelli v0.1 ~by Giorgio Arguzzi

Hi. My name is Arguzzi Giorgio, but everybody calls me Giorgio.

Pinturelli is a declarative library for drawing UI directly on the HTML canvas using q5.js. No frameworks. No servers. Just static code and lots of multimedia.

It’s loosely inspired by the original *actor model* from Smalltalk. Components behave like tiny living beings that send and receive messages, without fixed connections or prop drilling —simply the flow of messages— which makes it easy to build flexible and dynamic interaction systems.

Everything happens inside the canvas: independent node states, decoupled trees, touch gestures, and more. You can manipulate both the internal logic and the external container, from motion and graphics to layout and full DOM-level integration.

I’m developing this library for fun. This is my personal playground to explore new ways of thinking about user interfaces and the labor of coding. It’s 100% experimental, not recommended for serious office workers or production environments where compatibility and best practices are critical.

Released into the public domain<br>
CC0 1.0 Universal<br>
on May 1st, 2025

<br>

## Cheat sheet

| prefix | origin selector                      |
|--------|--------------------------------------|
| `_`    | root id (camelCase by convention)    |
| `#`    | node id (camelCase by convention)    |

| prefix | groups selector                      |
|--------|--------------------------------------|
| `>`    | followers of this node               |
| `<`    | followed by this node                |
| `~`    | equals (followers of followed node)  |
| `*`    | subtree (all followers, recursively) |

| prefix | filter selector                      |
|--------|--------------------------------------|
| `.`    | label (camelCase by convention)      |
| `/`    | ui class (always in PascalCase)      |
| `%`    | ui gesture (always in UPPER_CASE)    |

| prefix | event bus keys (always camelCase)    |
|--------|--------------------------------------|
| `$`    | primary event name (with suffix)     |
| `$`    | emitter channel (without suffix)     |
| `#`    | single node channel (node id)        |
| `@`    | public channel (no convention)       |

<br>

> **suffixes:**<br>* must start with a letter.<br>* they may include digits, hyphens (`-`) and underscores (`_`).<br>* whitespace and other special characters are not allowed.

<br>

## Learning stage:

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

### *Node API*

- node description
  - node id
  - root id
  - UiClass
- state
  - declaration
  - labels
  - following
  - left
  - top
  - width
  - height
  - nodeIsVisible
  - nodeLayer
  - painting
- paintings
  - declaration
  - arguments

### *Reaction API*

- listen
  - emitter
  - event bus
- channels
  - emitter channel
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
  - get global assets
  - q5 createGraphics
- state manager
  - get
  - set
- data manager
  - get
- time manager
  - get
- reaction relays
  - new message

<br>

## Advanced stage:

### *Dev Tools*

- **api errors**
- **debug mode** 
- **memory logs**
- **nodes tracker**
- **events tracker**

### *Selection*

- **origin**
- **groups**
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
  - **ignored**

### *Node API*

- node description
  - node id
  - root id
  - UiClass
  - **UiGestures**
- state
  - declaration
  - labels
  - following
  - left
  - **right**
  - top
  - **bottom**
  - width
  - height
  - **proportion**
  - **offsetX**
  - **offsetY**
  - **treeIsVisible**
  - nodeIsVisible
  - **treeLayer**
  - nodeLayer
  - painting
  - **overlayed painting**
  - **pseudo css units**
- **local assets**
  - **declaration**
  - **lazy loading**
- paintings
  - declaration
  - arguments
  - **painter**

### *Reaction API*

- listen
  - emitter
  - event bus
- **stopListening**
- channels
  - emitter channel
  - single node channel
  - **public channel**
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
  - **get local assets**
  - get global assets
  - q5 createGraphics
- state manager
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - set
  - **setByObject**
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

<br>

***

### About q5.js (Pinturelli’s only dependency)

Repository: [https://github.com/q5js/q5.js](https://github.com/q5js/q5.js)

Landing page: [https://q5js.org/home/](https://q5js.org/home/)

It’s a project that *"aims to continue the legacy of the incredible work done by Ben Fry and Casey Reas on Java Processing, Lauren McCarthy's work on p5.js, and all contributors to these projects."*

*"The original q5xjs (v0) was created by @LingDong~ and released under the public domain Unlicense license."*

*"q5.js is open source under the [LGPLv3](https://github.com/q5js/q5.js/blob/main/LICENSE.md), created and actively maintained by @quinton-ashley. The q5 team includes contributor @Tezumie."*
