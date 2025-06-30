//////////////////////////////
//
// static flag
// flag for internal use only, never true in final bundle.
// allows removing all format validations (via Rollup's tree shaking)
export const testMode = true; // <--named export and hardcoded value!!!

//////////////////////////////
//
// debug flags
const debugState = { apiErrors: true, checkpoints: true };
export const setApiErrors = flagValue => debugState.apiErrors = !!flagValue;
export const setCheckpoints = flagValue => debugState.checkpoints = !!flagValue;

//////////////////////////////
//
// trackers flags
const createTracker = () => {
  const idsByRootId = new Map();
  return {
    getFlag: (rootId, targetId) => {
      const targetsSet = idsByRootId.get(rootId);
      if (!targetsSet) return false;
      if (targetsSet.has("*")) return true;
      return targetsSet.has(targetId);
    },
    setTrackedIds: (rootId, targetIds) => {
      idsByRootId.set(rootId, new Set(targetIds));
    },
    clearRootId: rootId => {
      idsByRootId.delete(rootId);
    }
  }
}

const memoryFlags = createTracker();
const eventsFlags = createTracker();
const clearTrackers = rootId => {
  memoryFlags.clearRootId(rootId);
  eventsFlags.clearRootId(rootId);
}

//////////////////////////////
//
export default {
	get err() { return debugState.apiErrors },
	get log() { return debugState.checkpoints },
  getMemoryFlag: memoryFlags.getFlag,
  setMemoryTracker: memoryFlags.setTrackedIds,
  getEventsFlag: eventsFlags.getFlag,
  setEventsTracker: eventsFlags.setTrackedIds,
  clearTrackers,
}
