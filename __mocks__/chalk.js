/**
 * Mock for chalk library (ESM compatibility for Jest)
 * 
 * Provides a simple mock that returns the input string without ANSI codes
 * for testing purposes.
 */

const createChalkMock = () => {
  const chalkFn = (str) => str;
  
  // Add color methods
  const colors = [
    'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'grey',
    'black', 'redBright', 'greenBright', 'yellowBright', 'blueBright',
    'magentaBright', 'cyanBright', 'whiteBright'
  ];
  
  colors.forEach(color => {
    chalkFn[color] = (str) => str;
  });
  
  // Add background colors
  const bgColors = [
    'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite',
    'bgBlack', 'bgRedBright', 'bgGreenBright', 'bgYellowBright', 'bgBlueBright',
    'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright'
  ];
  
  bgColors.forEach(color => {
    chalkFn[color] = (str) => str;
  });
  
  // Add modifiers
  const modifiers = ['bold', 'dim', 'italic', 'underline', 'inverse', 'hidden', 'strikethrough'];
  
  modifiers.forEach(modifier => {
    chalkFn[modifier] = (str) => str;
  });
  
  return chalkFn;
};

const chalk = createChalkMock();

module.exports = chalk;
module.exports.default = chalk;

