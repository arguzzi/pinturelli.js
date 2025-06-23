//////////////////////////////
//
// flag for internal use only, never true in final bundle.
// allows removing all format validations (via Rollup's tree shaking)
export const testMode = true; // <--named export and hardcoded value!!!

//////////////////////////////
//
// dynamic flags
const state = {
	apiErrors: true,
	checkpoints: true,
}

// setters
export const setApiErrors = flagValue => state.apiErrors = !!flagValue;
export const setCheckpoints = flagValue => state.checkpoints = !!flagValue;

// getters
export default {
	get err() { return state.apiErrors },
	get log() { return state.checkpoints },
}
