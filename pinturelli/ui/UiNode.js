import dbgr from "../debug/validateUiNode.js";

export default class UiNode {
  
  // private
  #id;
  #x; #y;
  #w; #h;
  #localX;
  #localY;
  #depthLevel;
  #isVisible;

	//____________
  constructor(GLOBAL, LOCAL) {
    if (GLOBAL.CONFIG.debug) {
      dbgr.constructorParams(new.target, UiNode, GLOBAL, LOCAL);
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
    this._buffer = isVisible ? this._createBuffer() : null;
		this._screenshot = null;
    
		this._assets = []; // [{loadFn, sourceStrn, callbackFn, loadedObjct}, {...}]
		this._nested = []; // [node, node, node, ...]
		this._events = {};
  }

	//____________
	get id() { return this.#id }
	get x() { return this.#x }
	get y() { return this.#y }
	get w() { return this.#w }
	get h() { return this.#h }
  
  get localX() { return this.#localX }
  set localX(posX) {
    if (this.DEBUG) dbgr.typedParams.number(posX);
    this.#localX = posX;
    this._updatePosition();
  }
  
  get localY() { return this.#localY }
  set localY(posY) {
		if (this.DEBUG) dbgr.typedParams.number(posY);
    this.#localY = posY;
    this._updatePosition();
  }

  get depthLevel() { return this.#depthLevel }
  set depthLevel(newLevel) {
    if (this.DEBUG) dbgr.typedParams.number(newLevel);
    this.#depthLevel = newLevel;
  }

  get isVisible() { return this.#isVisible }
  set isVisible(state) {
    if (this.DEBUG) dbgr.typedParams.boolean(state);
    if (state) this._createBuffer();
    else this._removeBuffer();
    this.#isVisible = state;
  }

	//____________
	_updatePosition() {
    this.#x = this.PARENT.x + this.#localX;
    this.#y = this.PARENT.y + this.#localY;

    const canvas = this.GLOBAL.CONFIG.canvas;

		if (
			this.#x > canvas.w ||
			this.#y > canvas.h ||
			this.#x + this.#w < 0 ||
			this.#y + this.#h < 0
		) this.#isVisible = false;
		else this.#isVisible = true;
  }

  //____________
  _createBuffer() {
    if (this._buffer) return;
    this._buffer = createGraphics(this.w, this.h);
  }

  _removeBuffer() {
    if (!this._buffer) return;
    this._buffer.remove();
    this._buffer = null;
  }

  _updateBuffer(drawFunction, time, ...args) {
    if (!this._buffer) return;
    drawFunction(this._buffer, time, ...args);
  }
  
  _drawBuffer() {
    if (!this.isVisible) return;
    image(this._buffer, this.#x, this.#y);
  }

  _eraseBuffer() {
		erase();
		rect(this.#x, this.#y, this.#w, this.#h);
		noErase();
  }

  //____________
  _createScreenshot(initial = true) {
		if (initial) this.PARENT._breakScreenshot();
    if (!initial && this._screenshot) return;
    
		if (this._screenshot) {
      this._screenshot.remove();
      this._screenshot = null;
    }

    const canvas = this.GLOBAL.CONFIG.canvas
		this._screenshot = createGraphics(canvas.w, canvas.h);
		if (this.#isVisible) this._screenshot.image(this._buffer, this.#x, this.#y);
		
		for (const node of this._nested) {
			node._createScreenshot(false);
			this._screenshot.image(node._screenshot, node.x, node.y);
      node._screenshot.remove();
			node._screenshot = null;
		}
  }
  
	_breakScreenshot() {
    if (this._screenshot) {
      this._screenshot.remove();
      this._screenshot = null;
    }

    if (this.PARENT === this.GLOBAL.MAGIC_NUMBER) return;
    this.PARENT._breakScreenshot();	
	}

  //____________
  _checkAreaCollision(mx, my) {
    if (this.DEBUG) dbgr.typedParams.number(mx, my);

		if (
			mx < this.#x ||
			mx > this.#x + this.#w ||
			my < this.#y ||
			my > this.#y + this.#h
		) return false;
		return true;
	}

  _checkColorCollision(mx, my) {
		if (!this._buffer || !this._checkAreaCollision(mx, my)) return false;

		const px = mx - this.#x;
		const py = my - this.#y;    
		return this._buffer.get(px, py)[3] < 1; // alpha channel
	}

  //____________
  _publish(eventName) {
    if (this.DEBUG) dbgr.typedParams.string(eventName);
    this.GLOBAL.EVENT_BUS.publish(this.id, eventName);
  }

  _subscribe(publisherId, eventName, callbacks) {
    if (this.DEBUG) dbgr.subscribeParams(publisherId, eventName, callbacks);
    this.GLOBAL.EVENT_BUS.subscribe(publisherId, eventName, this.id, callbacks);
  }

  _unsubscribe(publisherId, eventName) {
    if (this.DEBUG) dbgr.unsubscribeParams(publisherId, eventName);
    this.GLOBAL.EVENT_BUS.unsubscribe(publisherId, eventName, this.id);
  }

  //////////////////////////////
  // USER API
  //____________
	add(newNode) {
		if (this.GLOBAL.CONFIG.debug) dbgr.instanceParam(newNode);

		const	lastNested = this._nested.at(-1);
		this._nested.push(newNode);

    const allNodes = this.GLOBAL.ALL_NODES;
    allNodes[newNode.id] = newNode;
		
		const drawList = this.GLOBAL.DRAW_LIST;
		const lastNestedPosition = lastNested ? drawList.indexOf(lastNested)
      : drawList.indexOf(this);

		drawList.splice(lastNestedPosition + 1, 0, newNode);
	}
  //
	//____________
  propagate(callback, ...args) {
    if (callback.call(this, ...args) === false) return;
    for (const node of this._nested) {
      node.propagate(callback, ...args);
    }
  }
  //
  //____________
  propagatePostOrder(callback, ...args) {
    for (const node of this._nested) {
      if (node.propagatePostOrder(callback, ...args) === false) return false;
    }
    return callback.call(this, ...args);
  }
}
