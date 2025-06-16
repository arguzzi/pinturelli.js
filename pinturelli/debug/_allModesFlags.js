//////////////////////////////
//
// dev flag for internal use only, never true in production.
// allows removing all type and format checks from the final bundle
export const devMode = true; // <--named export and hardcoded value

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
