import { typedParams } from "./_typeValidators.js";

//////////////////////////////
//
export const firstLog = (debug, instance) => {
  // dev mode
  // dev mode
  const activeMessage = `is now active.\n# > \x1b[3mFor max performance, pass {debugMode: false}\x1b[0m\n# > \x1b[3mor simply leave out the second argument\x1b[0m`;
  const inactiveMessage = `is off... so, savor the silence ✧♪\n# > \x1b[3mEnable it by passing {debugMode: true}\x1b[0m\n# > \x1b[3mas the second argument to createPinturelli\x1b[0m`;
  console.log(`_____________________\n#\n#       /\\_/\\  \n#      ( ^_^ ) \n#       > ^ <\n#\n# Hi there!\n# Welcome to Pinturelli\n# Debugger ${debug ? activeMessage : inactiveMessage}\n# > \x1b[3m[instance: ${instance}]\x1b[0m\n#`);
}

//////////////////////////////
//
export const logger = ({ INITIAL_TIME, INSTANCE }, ...logs) => {
  typedParams.number("Debug (logger)", INITIAL_TIME, INSTANCE); // dev mode
  typedParams.string("Debug (logger)", ...logs); // dev mode
  const timeTaken = Date.now() - INITIAL_TIME;
  const logsLines = logs.reduce((acc, line) => acc + `\n# ${line}`, "");
  console.log(`_____________________\n# \x1b[1m${logsLines}\x1b[0m\n# > \x1b[3m${timeTaken}ms since initialization\x1b[0m\n# > \x1b[3m[instance: ${INSTANCE}]\x1b[0m\n#`);
}

//////////////////////////////
//
export const checkNodes = (ALL_NODES) => {
  console.log(`# > \x1b[3mCheck de active nodes:\x1b[0m\n`, ALL_NODES);
}

//////////////////////////////
//
export const throwError = (origin, message) => {
  typedParams.string("Debug (throwError)", origin, message); // dev mode
  throw new Error(`\n_____________________\n#\n# From ${origin}: ${message}.\n_____________________\n#\n# Check the call-stack:`);
}

//////////////////////////////
//
export default {
  firstLog,
  logger,
  checkNodes,
  throwError,
}
