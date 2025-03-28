export default function loadSketch({ CONFIG, EMITTER, ALL_NODES }) {
  const { initDateNow } = CONFIG;

  //____________
  window.preload = function() {
   
    // ready = {sourceStrn: loadedObjct, sourceStrn: loadedObjct, ...}
    const ready = {};

    // assets = [{loadFn, sourceStrn, callbackFn, loadedObjct}, {...}]
    for (const node in ALL_NODES) {
      if (node.assets.length === 0) continue;

      node.assets.forEach((asset) => {
        if (ready[asset.source]) {
          asset.loaded = ready[asset.source].loaded;
          return;
        };

        asset.loaded = asset.q5load(asset.source, asset.callback);
        ready[asset.source].loaded = asset.loaded;
      });
    }
  }

  //____________
  window.setup = function() {
    createCanvas(400, 400, { alpha: true });
    noLoop();
    clear();
    
    if (CONFIG.debug) {
      console.log(`Setup finished at ${Date.now() - initDateNow}ms`)
    }
  }

  //____________
  window.touchStarted = function(_evnt) {
    _evnt.preventDefault();
    EMITTER.touchStarted(_evnt, {
      t: Date.now() - initDateNow,
      x: mouseX,
      y: mouseY,
    });
  }

  //____________
  window.touchEnded = function(_evnt) {
    _evnt.preventDefault();
    EMITTER.touchEnded(_evnt, {
      t: Date.now() - initDateNow,
      x: mouseX,
      y: mouseY,
    });
  }

  //____________
  window.touchDragged = function(_evnt) {
    _evnt.preventDefault();
    EMITTER.touchDragged(_evnt, {
      t: Date.now() - initDateNow,
      x: mouseX,
      y: mouseY,
    });
  }
}