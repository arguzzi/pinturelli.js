# Pinturelli v0.1 ~by Giorgio Arguzzi

Hi. My name is Arguzzi Giorgio, but everybody calls me Giorgio.

Pinturelli is a declarative library for drawing UI directly on the HTML canvas using q5.js. No frameworks. No servers. Just static code and lots of multimedia.

It’s loosely inspired by the original *actor model* from Smalltalk. Components behave like tiny living beings that send and receive messages, without fixed connections or prop drilling —simply the flow of messages— which makes it easy to build flexible and dynamic interaction systems.

Everything happens inside the canvas: independent node states, decoupled trees, touch gestures, and more. You can manipulate both the internal logic and the external container, from motion and graphics to layout and full DOM-level integration.

I’m developing this library for fun. This is my personal playground to explore new ways of thinking about user interfaces and the labor of coding. It’s 100% experimental, not recommended for serious office workers or production environments where compatibility and best practices are critical.

Released into the public domain<br>
CC0 1.0 Universal
on May 1st, 2025

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
  - id
  - root
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

- hear
  - event bus
  - primary emitter
- data
  - properties
  - primary request
- channel
  - node channel
- reaction modes
  - snapshots
  - sequences
- reaction options
  - delay (startAt)
  - default time
- reaction syntax
  - config
  - update
  - relays
- buffer
  - get global assets
  - q5 createGraphics
- state managers
  - get
  - set
- data managers
  - get
- time managers
  - get

<br>

## Advanced stage:

### *Dev Tools*

- **automatic errors**
- **debug mode** 
- **memory logs**
- **nodes tracker**
- **events tracker**

### *Selection*

- **origin**
- **path**

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
  - id
  - root
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
- **local assets**
  - **declaration**
  - **lazy loading**
- paintings
  - declaration
  - arguments
  - **painter**

### *Reaction API*

- hear
  - event bus
  - primary emitter
  - **semantic names**
- **stopHearing**
- data
  - properties
  - primary request
  - **mutation**
- channel
  - node channel
  - **public channel**
- reaction modes
  - **first**
  - **propagation**
  - snapshots
  - sequences
- reaction options
  - delay (startAt)
  - **riskyRepeat**
  - default time
  - **bezier time**
  - **steps time**
- reaction syntax
  - config
  - **validate**
  - update
  - **last update**
  - relays
- buffer
  - **get local assets**
  - get global assets
  - q5 createGraphics
- state managers
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - set
  - **setByObject**
- data managers
  - get
  - **getByKeys**
  - **riskyPatch**
  - **riskyPatchByObject**
  - **riskyRelay**
- time managers
  - get
  - **riskyPatch**

<br>

***

### About q5.js (Pinturelli’s only dependency)

Repository: [https://github.com/q5js/q5.js](https://github.com/q5js/q5.js)

Landing page: [https://q5js.org/home/](https://q5js.org/home/)

It’s a project that *"aims to continue the legacy of the incredible work done by Ben Fry and Casey Reas on Java Processing, Lauren McCarthy's work on p5.js, and all contributors to these projects."*

*"The original q5xjs (v0) was created by @LingDong~ and released under the public domain Unlicense license."*

*"q5.js is open source under the LGPLv3, created and actively maintained by @quinton-ashley. The q5 team includes contributor @Tezumie."*

**Internally uses:**

- WebGPU MSDF text rendering: [https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf](https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf)

- WebGPU blendMode: [https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html](https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html)

- HSLtoRGB: [https://stackoverflow.com/a/64090995/3792062](https://stackoverflow.com/a/64090995/3792062)

- HSBtoHSL: [https://stackoverflow.com/a/66469632/3792062](https://stackoverflow.com/a/66469632/3792062)

- OKLCHtoRGB: [https://gist.github.com/dkaraush/65d19d61396f5f3cd8ba7d1b4b3c9432](https://gist.github.com/dkaraush/65d19d61396f5f3cd8ba7d1b4b3c9432) and [https://github.com/color-js/color.js/blob/main/src/spaces/oklch.js](https://github.com/color-js/color.js/blob/main/src/spaces/oklch.js)

- A JS Implementation of Ziggurat Algorithm: [http://ziggurat.glitch.me/](http://ziggurat.glitch.me/)

- p5.js Vector.slerp: [https://github.com/processing/p5.js/blob/v1.10.0/src/math/p5.Vector.js#L2803](https://github.com/processing/p5.js/blob/v1.10.0/src/math/p5.Vector.js#L2803)

- p5.js random: [https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js](https://github.com/processing/p5.js/blob/1.1.9/src/math/noise.js)
