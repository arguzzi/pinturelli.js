import { devMode } from "./_devModeFlag.js";
import { typedParams } from "./_typeValidators.js";

//////////////////////////////
//
export const throwError = (origin, message) => {
  if (devMode) typedParams.string("Debug output (throwError)", origin, message);
  throw new Error(`\n_____________________\n#\n# From ${origin}: ${message}.\n_____________________\n#\n# Check the call-stack:`);
}

//////////////////////////////
//
export const firstLog = (flagErrors, rootId) => {
  if (devMode) {
    typedParams.boolean("Debug output (firstLog)", flagErrors);
    typedParams.string("Debug output (firstLog)", rootId);
  }
  const activeMessage = `is now active.\n# > \x1b[3mFor max performance, pass {debugMode: false}\x1b[0m\n# > \x1b[3mor simply leave out the second argument\x1b[0m`;
  const inactiveMessage = `is off... so, savor the silence ✧♪\n# > \x1b[3mEnable it by passing {debugMode: true}\x1b[0m\n# > \x1b[3mas the second argument to createPinturelli\x1b[0m`;
  console.log(`_____________________\n#\n#       /\\_/\\  \n#      ( ^_^ ) \n#       > ^ <\n#\n# Hi there!\n# Welcome to Pinturelli\n# Debugger ${flagErrors ? activeMessage : inactiveMessage}\n# > \x1b[3m[instance: ${rootId}]\x1b[0m\n#`);
}

//////////////////////////////
//
export const checkStructure = (structureName, structure) => {
  if (devMode) typedParams.string("Debug output (checkStructure)", structureName);
  console.log(`# > \x1b[3mCheck ${structureName}:\x1b[0m\n`, structure);
}

//////////////////////////////
//
export const genericLogger = (rootId, ...logs) => {
  if (devMode) typedParams.string("Debug output (genericLogger)", ...logs);
  const logsLines = logs.reduce((acc, line) => acc + `\n# ${line}`, "");
  console.log(`_____________________\n# \x1b[1m${logsLines}\x1b[0m\n# > \x1b[3m${performance.now()}ms since initialization\x1b[0m\n# > \x1b[3m[root: ${rootId}]\x1b[0m\n#`);
}

//////////////////////////////
//
export default {
  throwError,
  firstLog,
  checkStructure,
  genericLogger,
}
