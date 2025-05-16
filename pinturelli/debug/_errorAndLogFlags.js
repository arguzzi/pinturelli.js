// state
let apiErrorsMode = true;
let memoryLogsMode = true;

// setters
export const setApiErrors = flagValue => apiErrorsMode = !!flagValue;
export const setMemoryLogs = flagValue => memoryLogsMode = !!flagValue;

// getters
export default {
  get err() { return apiErrorsMode },
  get log() { return memoryLogsMode },
}
