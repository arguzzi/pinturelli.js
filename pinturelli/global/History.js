export default class History {
  static singleton;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL) {
    if (History.singleton) return History.singleton;
    History.singleton = this;
    
    this.GLOBAL = GLOBAL;
  }

  getPipeline() {
    return (_e, _s) => {};
  }

  getStatusManager() {
    return {};
  }
}