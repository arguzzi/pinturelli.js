import { testMode } from "./_allModesFlags.js";
import { typedParams } from "./_typeValidators.js";

//////////////////////////////
//
export const throwError = (origin, message) => {
  if (testMode) typedParams.string("Debug output (throwError args)", origin, message);

  throw new Error(`\n_____________________\n#`
    + `\n# From ${origin}: ${message}.\n#`
    + `\n# Check the call-stack:`);
}

//////////////////////////////
//
export const genericLogger = (rootId, ...logs) => {
  if (testMode) typedParams.string("Debug output (genericLogger args)", rootId, ...logs);
  const logsLines = logs.reduce((acc, line) => acc + `\n# ${line}`, "");
  const now = Math.round(performance.now());

  console.log(`_____________________\n#`
    + `\x1b[1m${logsLines}\x1b[0m`
    + `\n# >\x1b[3m ${now}ms since initialization\x1b[0m`
    + `\n# >\x1b[3m [root: ${rootId}]\x1b[0m\n#`);
}

//////////////////////////////
//
export const checkStructure = (structureName, structure) => {
  if (testMode) typedParams.string("Debug output (checkStructure arg0)", structureName);
  console.log(`# >\x1b[3m Check ${structureName}:\x1b[0m\n`, structure, "\n\n");
}

//////////////////////////////
//
export const firstLog = (flagDebugMode, flagErrorsMode) => {
  if (testMode) typedParams.boolean("Debug output (firstLog arg0)", flagDebugMode, flagErrorsMode);
  
  const noErrorsModeLog = `...\n# but error validations aren't\n#`;
  const errorsModeLog = `\n#\n# This enables:`
    + `\n# 1. the user api error validations (heavy)`
    + `\n# 2. and the checkpoints logs (lightweight)\n#`
    + `\n# For simulating a near-final performance`
    + `\n# add "?noErrors" to your script/module path\n#`

  const debugModeLog = `IS ACTIVE`
    + (flagErrorsMode ? errorsModeLog : noErrorsModeLog)
    + `\n# For removing all debug features`
    + `\n# use "?finalMode" instead of "?noErrors"`;

  const finalModeLog = `IS OFF...`
    + `\n# so enjoy the silence 𝄽\n#`
    + `\n# To enable it: go to your script/module path`
    + `\n# and delete the query parameter "finalMode"`;

  console.log(`_____________________\n#`
    + `\n#       /\\_/\\   ${flagDebugMode ? `${flagErrorsMode ? `𝄢` : ` `}  ♪` : ` `}`
    + `\n#  ${flagDebugMode ? `♪` : ` `}   ( ^_^ )    ${flagDebugMode ? `✧` : ` `}`
    + `\n#   ${flagDebugMode ? `♫` : ` `}   > ^ <    ${flagDebugMode && flagErrorsMode ? `𝄪` : ` `}\n#`
    + `\n# Hi there`
    + `\n# Welcome to Pinturelli v0.2\n#`
    + `\n# DEBUG MODE ${flagDebugMode ? debugModeLog : finalModeLog}\n#`
    + `\n# > <A> <J> <C> <S> <M> <`
    + `\n# >\x1b[3m pinturelli.js ~by Giorgio Arguzzi\x1b[0m`
    + `\n# >\x1b[3m published under CC0 1.0 Universal\x1b[0m`
    + `\n# > http://arguzzi.github.io/pinturelli.js \n#`);
}

//////////////////////////////
//
export default {
  throwError,
  genericLogger,
  checkStructure,
  firstLog,
}
