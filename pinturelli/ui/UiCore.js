import dbgr from "../debug/validateUiCore.js";
import userDbgr from "../debug/validateUserApi.js";

export default class UiCore {
  
  // private
  #id;
  #x; #y;
  #w; #h;
  #localX;
  #localY;
  #depthLevel;
  #isVisible;
  #buffer;
  #screenshot;

	//____________
  // public properties will be freezed!!!
  constructor(GLOBAL, LOCAL) {
    if (GLOBAL.CONFIG.debug) {
      dbgr.constructorParams({ GLOBAL, LOCAL }, new.target, UiCore);
    }

    const {
      parent,
      id,
      localPosX,
			localPosY,
			localWidth,
			localHeight,
      depthLevel,
			isVisible
		} = LOCAL;

    this.GLOBAL = GLOBAL;
		this.SKETCH = GLOBAL.SKETCH;
    this.DEBUG = GLOBAL.CONFIG.debug;
		this.PARENT = parent;

    this.#id = id;

    this.#w = localWidth;
    this.#h = localHeight;
		
    this.#localX = localPosX;
    this.#localY = localPosY;
    this._updatePosition();
		
    this.#depthLevel = depthLevel ?? parent.depthLevel ?? 0;
    
		this.#isVisible = isVisible;
    this.#buffer = isVisible ? this._createBuffer() : null;
		this.#screenshot = null;
    
    // reminder:
    // from (pre) = {source: [load, callback], source: [load, callback], ...}
    // to (post) = {source: {Object_loaded}, source: {Object_loaded}, ...}
		this.ASSETS = {};

    // reminder:
    // [{Object_newNode}, {Object_newNode}, ...]
		this.NESTED = [];

    // reminder:
    // ["label", "label", "label", ...]
		this.LABELS = [];

    // reminder:
    // {"$eventName", "$eventName", "$eventName", ...]
		this.PRIMARY_EVENTS = {};

    // reminder:
    // {pubId: [eventName, eventName...], pubId: [], ...}
		this.SUBSCRIPTIONS = {};
  }

	//____________
	get id() { return this.#id }
	get x() { return this.#x }
	get y() { return this.#y }
	get w() { return this.#w }
	get h() { return this.#h }
  
  get localX() { return this.#localX }
  set localX(posX) {
    if (this.DEBUG) dbgr.typedParams.number("Ui core (localX)", posX);
    this.#localX = posX;
    this._updatePosition();
  }
  
  get localY() { return this.#localY }
  set localY(posY) {
		if (this.DEBUG) dbgr.typedParams.number("Ui core (localY)", posY);
    this.#localY = posY;
    this._updatePosition();
  }

  get depthLevel() { return this.#depthLevel }
  set depthLevel(newLevel) {
    if (this.DEBUG) dbgr.typedParams.number("Ui core (depthLevel)", newLevel);
    this.#depthLevel = newLevel;
  }

  get isVisible() { return this.#isVisible }
  set isVisible(state) {
    if (this.DEBUG) dbgr.typedParams.boolean("Ui core (isVisible)", state);
    if (state) this._createBuffer();
    else this._removeBuffer();
    this.#isVisible = state;
  }

	//____________
  // UiRoot case handled in subclass
	_updatePosition() {
    this.#x = this.PARENT.x + this.#localX;
    this.#y = this.PARENT.y + this.#localY;

    const canvas = this.GLOBAL.CONFIG.CANVAS;

		if (
			this.#x > canvas.resolutionX ||
			this.#y > canvas.resolutionY ||
			this.#x + this.#w < 0 ||
			this.#y + this.#h < 0
		) this.#isVisible = false;
		else this.#isVisible = true;
  }

  //____________
  _createBuffer() {
    if (this.#buffer) return;
    this.#buffer = this.SKETCH.createGraphics(this.w, this.h);
  }

  _removeBuffer() {
    if (!this.#buffer) return;
    this.#buffer.remove();
    this.#buffer = null;
  }

  _updateBuffer(drawFunction, time, ...args) {
    if (!this.#buffer) return;
    drawFunction(this.#buffer, time, ...args);
  }
  
  _drawBuffer() {
    if (!this.isVisible) return;
    image(this.#buffer, this.#x, this.#y);
  }

  _eraseBuffer() {
		erase();
		rect(this.#x, this.#y, this.#w, this.#h);
		noErase();
  }

  //____________
  // UiRoot case handled in subclass
  _createScreenshot(initial = true) {
		if (initial) this.PARENT._breakScreenshot();
    if (!initial && this.#screenshot) return;
    
		if (this.#screenshot) {
      this.#screenshot.remove();
      this.#screenshot = null;
    }

    const canvas = this.GLOBAL.CONFIG.CANVAS;
		this.#screenshot = createGraphics(canvas.resolutionX, canvas.resolutionY);
		if (this.#isVisible) this.#screenshot.image(this.#buffer, this.#x, this.#y);
		
		for (const node of this.NESTED) {
			node._createScreenshot(false);
			this.#screenshot.image(node._screenshot, node.x, node.y);
      node._screenshot.remove();
			node._screenshot = null;
		}
  }
  
	_breakScreenshot() {
    if (this.#screenshot) {
      this.#screenshot.remove();
      this.#screenshot = null;
    }

    if (this.PARENT === this.GLOBAL.MAGIC_NUMBER) return;
    this.PARENT._breakScreenshot();	
	}

  //____________
  _checkAreaCollision(mx, my) {
    if (this.DEBUG) dbgr.typedParams.number("Ui core (collision)", mx, my);

		if (
			mx < this.#x ||
			mx > this.#x + this.#w ||
			my < this.#y ||
			my > this.#y + this.#h
		) return false;
		return true;
	}

  _checkColorCollision(mx, my) {
		if (!this.#buffer || !this._checkAreaCollision(mx, my)) return false;
		return this.#buffer.get(mx - this.#x, my - this.#y)[3] < 1; // alpha channel
	}

  //____________
  // reminder:
  // this._subscriptions = {pubId: [eventName, eventName...], pubId: [], ...}
  _publish(event$name, event) {
    if (this.DEBUG) dbgr.publishParams(event$name, event);
    this.GLOBAL.EVENT_BUS.publish(this.id, event$name, event);
  }

  _subscribe(pubId, event$name, callbacks) {
    if (this.DEBUG) dbgr.subscribeParams(this, pubId, event$name, callbacks);
    this.GLOBAL.EVENT_BUS.subscribe(pubId, event$name, this.id, callbacks);

    const subscriptions = this.SUBSCRIPTIONS;
    if (!Array.isArray(subscriptions[pubId])) subscriptions[pubId] = [];
    if (subscriptions[pubId].includes(event$name)) return;
    subscriptions[pubId].push(event$name);
  }

  _unsubscribe(pubId, event$name) {
    if (this.DEBUG) dbgr.unsubscribeParams(this, pubId, event$name);
    this.GLOBAL.EVENT_BUS.unsubscribe(pubId, event$name, this.id);
    this.SUBSCRIPTIONS.splice(this.SUBSCRIPTIONS.indexOf(event$name), 1);
  }

  //////////////////////////////
  // * * * * * * * * * * * * *
  // * 
  // *     .  .
  // * . ° .::. ° .
  // * > USER API <
  // *    ~.**.~
  // *    ´ <> `
  // * ____________

	add(seed) {
    const NEW_LOCAL = {
      parent: this,
      id: seed.id,
      localPosX: seed.x ? seed.x : 0,
			localPosY: seed.y ? seed.y : 0,
			localWidth: seed.w ? seed.w : 200,
			localHeight: seed.h ? seed.h : 200,
      depthLevel: seed.level ? seed.level : 1,
			isVisible: seed.visible ? seed.visible : true,
    };
    
    const classes = this.GLOBAL.CLASSES;
    const newNode = new classes[seed.type](this.GLOBAL, NEW_LOCAL);
    Object.freeze(newNode); // public properties will be freezed!!!

		if (this.DEBUG) userDbgr.add(newNode, UiCore);

		const lastNested = this.NESTED.at(-1);
		this.NESTED.push(newNode);

    const allNodes = this.GLOBAL.ALL_NODES;
    allNodes.set(newNode.id, newNode);
		
		const drawList = this.GLOBAL.DRAW_LIST;
		const lastNestedPosition = lastNested ? drawList.indexOf(lastNested)
      : drawList.indexOf(this);

		drawList.splice(lastNestedPosition + 1, 0, newNode);
    
    return newNode;
	}
  // *"'´
  // *     .<>.
  // * ____________

  doWhen(publisherId, event$name, callbacks) {
    if (this.DEBUG) {
      userDbgr.doWhen(this.GLOBAL, publisherId, event$name, callbacks);
    }
    
    if (publisherId === "#") publisherId = this.id;
    if (publisherId === "$") publisherId = "emitter";
    if (typeof callbacks === "function") callbacks = [callbacks];
    this._subscribe(publisherId, event$name, callbacks);
  }
  // *"'´
  // *     .<>.
  // * ____________

  when(publisherId, combinations) {
    if (this.DEBUG) {
      userDbgr.when(this.GLOBAL, publisherId, combinations);
    }
    
    // reminder:
    // combination = {event$name: callbacks, event$name: callbacks, ...}
    if (publisherId === "#") publisherId = this.id;
    if (publisherId === "$") publisherId = "emitter";
    for (const [event$name, callbacks] of Object.entries(combinations)) {
      if (typeof callbacks === "function") callbacks = [callbacks];
      this._subscribe(publisherId, event$name, callbacks);
    }
  }
  // *"'´
  // *     .<>.
  // * ____________

  stopDoingWhen(publisherId, event$name) {
    if (this.DEBUG) {
      userDbgr.stopDoingWhen(this.GLOBAL, publisherId, event$name);
    }
    
    if (publisherId === "#") publisherId = this.id;
    this._unsubscribe(publisherId, event$name);
  }
  // *"'´
  // *     .<>.
  // * ____________

  propagate(callback, ...args) {
    if (this.DEBUG) userDbgr.propagate(callback);

    if (callback.call(this, ...args) === false) return;
    for (const node of this.NESTED) {
      node.propagate(callback, ...args);
    }
  }
  // *"'´
  // *     .<>.
  // * ____________

  propagatePostOrder(callback, ...args) { // doesnt work !%!
    if (this.DEBUG) userDbgr.propagatePostOrder(callback);

    for (const node of this.NESTED) {
      if (node.propagatePostOrder(callback, ...args) === false) return false;
    }
    return callback.call(this, ...args);
  }
  // *"'´
  // *     .<>.
  // * ____________

  bubble(callback, ...args) {
    if (this.DEBUG) userDbgr.bubble(callback);

    if (
      callback.call(this, ...args) === false ||
      this.PARENT === this.CONFIG.MAGIC_NUMBER
    ) return;

    this.PARENT.bubble(callback, ...args);
  }
  // *"'´
  // *     .<>.
  // * ____________

  bubbleReverse(callback, ...args) { // doesnt work !%!
    if (this.DEBUG) userDbgr.bubbleReverse(callback);

    if (
      this.PARENT === this.CONFIG.MAGIC_NUMBER ||
      this.PARENT.bubbleReverse(callback, ...args) === false
    ) return false;

    return callback.call(this, ...args);
  }
  // *"'´
  // *     .<>.
  // * ____________

  frame(paintings) {
    if (this.DEBUG) userDbgr.frame(paintings);
    this.GLOBAL.RENDERER.setSingleFrame(this, paintings);
  }
  // *"'´
  // *     .<>.
  // * ____________

  animate(duration, paintings, callback) {
    if (this.DEBUG) userDbgr.animate(duration, paintings, callback);
    this.GLOBAL.RENDERER.setAnimation(this, duration, paintings, callback);
  }
  // *"'´
  // *     .<>.
  // * ____________

  animateLoop(duration, paintings) {
    if (this.DEBUG) userDbgr.animateLoop(duration, paintings);
    this.GLOBAL.RENDERER.setLoopAnimation(this, duration, paintings);
  }
  // *"'´
  // *     .<>.
  // * ____________

  stopAnimation() {
    this.GLOBAL.RENDERER.stopAnimation(this);
  }
  // *"'´
  // *     ´<>`
  // *    2*`´*5
  // *  @pinturelli
  // *byGiorgioArguzzi
  // * * * * * * * * * * * * *
  //////////////////////////////
}
