

export default class CatPainter {
  #SKETCH;

  // control
  #isAnimating = false;
  #hasNextFrame = false;

  #idealDeltaTime;

	// caches
	#dirtyLayers = new Set();
	#allLayersPre = {}; // { zLayer: { priority: node, priority...}, zLayer...}
	#allLayersPost = {}; // { zLayer: painted, zLayer: painted, zLayer...}
	#createLayer = null;

	//____________
	constructor({ SKETCH, RX_MANAGER }) {
    this.#SKETCH = SKETCH;
    this.#idealDeltaTime = 1000 / SKETCH.getTargetFrameRate();

		this.#createLayer = (w = SKETCH.width, h = SKETCH.height) => {
			SKETCH.createGraphics(w, h);
		}
		
		SKETCH.draw = () => {
      const dirtyNodes = RX_MANAGER._getDirtyNodes();
			if (dirtyNodes.length=== 0) return;

      const allLayers = {};
      const getAccesedLayer = z => {
        const newLayer = {};
        allLayers[z] = newLayer;
        return newLayer;
      }

      for (const node of dirtyNodes) {
        const zLayer = node._getRawOutput("Z_LAYER");
        const layer = allLayers[zLayer] ?? getAccesedLayer(zLayer);

        const inside = node._getRawState("inside_layer")
        if (Object.hasOwn(layer, inside)) {
          // PENDING handle inside layer colision
        }

        layer[inside] = node;
      }

      // NOT THIS. JUST FOR TESTING NOW. each layer will be a buffer
      for (const [zLayer, insideLayer] of Object.entries(allLayers)) {
        for (const [inside, node] of Object.entries(insideLayer)) {
          const painting = node._getRawState("painting");
          const overlayed = node._getRawState("overlayed_painting");
          const state = node._outputManager;
          node._getPainting(painting)?.({ q5: SKETCH, state });
          node._getPainting(overlayed)?.({ q5: SKETCH, state });
        }
      }
    }

    RX_MANAGER._subscribeToControl(this);
	}

	//____________
  // rx manager subscription
  _startAnimating(){
    if (this.#isAnimating) return;
    this.#isAnimating = true;
    this.#SKETCH.loop();
  }

  _stopAnimating(){
    if (!this.#isAnimating) return;
    this.#isAnimating = false;
    const SKETCH = this.#SKETCH;
    SKETCH.noLoop();
    this._forceNextFrame();
  }

  _forceNextFrame(){
    if (this.#isAnimating || this.#hasNextFrame) return;
    this.#hasNextFrame = true;
    setTimeout(() => {
      this.#SKETCH.redraw();
      this.#hasNextFrame = false;
    }, this.#idealDeltaTime)
  }

	//____________
  // executed by setup
	_firstPaint() {
    // PENDING
	}

	//____________
	#updateLayers() {
		for (const zLayer of this.#dirtyLayers) {

			const dataManager = {};
			const timeManager = {};

			if (false) return;
			const newLayer = this.#repaintLayer(zLayer, dataManager, timeManager);
			this.#allLayersPost.set(zLayer, newLayer);
		}
	}

	//____________
	#repaintLayer(zLayer, dataManager, timeManager) {
		const newLayer = this.#createLayer(); // accumulated
		for (const node of Object.values(this.#allLayersPre[zLayer])) {

			// states
			const passiveManager = node._passiveManager;
			const {
				_finalX,
				_finalY,
				width,
				height,
				painting,
				overlayed_painting
			} = passiveManager.getByKeys(
				"_finalX",
				"_finalY",
				"width",
				"height",
				"painting",
				"overlayed_painting"
			);

			// painting functions
			const paintingFn = node._painting.get(painting);
			const overlayedFn = node._painting.get(overlayed_painting);
			
			// buffer mutation
			const buffer = this.#createLayer(width, height);
			paintingFn(q5, buffer, passiveManager, dataManager, timeManager);
			overlayedFn(q5, buffer, passiveManager, dataManager, timeManager);

			// accumulation
			newLayer.image(buffer, _finalX, _finalY);
		}

		return newLayer;
	}
}
