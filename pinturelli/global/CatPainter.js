

export default class CatPainter {

	// caches
	#dirtyLayers = new Set();
	#allLayersPre = {}; // { zLayer: { priority: node, priority...}, zLayer...}
	#allLayersPost = {}; // { zLayer: painted, zLayer: painted, zLayer...}
	#createLayer = null;

	//____________
	constructor({ GLOBAL }) {
		const sketch = GLOBAL.SKETCH;

		this.#createLayer = (w = sketch.width, h = sketch.height) => {
			sketch.createGraphics(w, h);
		}
		
		sketch.draw = () => {
			if (this.#dirtyLayers.size > 0) this.#updateLayers(); 
			sketch.clear();
			for (const layerPost of Object.values(this.#allLayersPost)) {
				sketch.image(layerPost, 0, 0);
			}
		}
	}

	//____________
	_firstPaint() {
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
				overlayedPainting
			} = passiveManager.getByKeys(
				"_finalX",
				"_finalY",
				"width",
				"height",
				"painting",
				"overlayedPainting"
			);

			// painting functions
			const paintingFn = node._painting.get(painting);
			const overlayedFn = node._painting.get(overlayedPainting);
			
			// buffer mutation
			const buffer = this.#createLayer(width, height);
			paintingFn(q5, buffer, passiveManager, dataManager, timeManager);
			overlayedFn(q5, buffer, passiveManager, dataManager, timeManager);

			// accumulation
			newLayer.image(buffer, _finalX, _finalY);
		}

		return newLayer;
	}

	// #markLayerAsDirty(zLayer) {
	// 	this.#dirtyLayers.add(zLayer);
	// }

	_setSnapshot(receiver, reaction, rxSymbol) {
	}

  _setSequence(receiver, reaction, rxSymbol) {
	}

	_getTimeManager(rxSymbol) {
	}
}
