// "&&name" multi points events:
// -> pinch, rotate
// -> tap, double-tap
// -> tap-holded, double-tap-holded

class PointerPipeline {
  constructor() {
    this.filters = [];
  }

  addFilter(filterFn) {
    this.filters.push(filterFn);
  }

  process(event) {
    let enrichedEvent = event;
    
    // Cada filtro puede modificar el evento o agregar propiedades
    for (const filter of this.filters) {
      enrichedEvent = filter(enrichedEvent);
      if (!enrichedEvent) return null; //  Si un filtro detiene el procesamiento
    }
    return enrichedEvent;
  }
}

// Filtro que agrega información de "click" si se detecta un pointerdown seguido de pointerup rápido
function clickFilterFactory() {
  let active = false;
  let downTime = 0;
  return function(event) {
    if (event.type === 'pointerdown') {
      active = true;
      downTime = Date.now();
      return event;
    }
    if (event.type === 'pointerup' && active) {
      const elapsed = Date.now() - downTime;
      if (elapsed < 200) {
        // Se enriquece el evento añadiendo la propiedad "semantic" con valor "click"
        event.semantic = 'click';
      }
      active = false;
      return event;
    }
    return event;
  };
}

export default clickFilterFactory;