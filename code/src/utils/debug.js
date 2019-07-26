// @flow

const util = require('util');


exports.inspect = function inspect(): void {
  let line = '';
  try {
    throw new Error();
  } catch (e) {
    line = e.stack.split(' at ')[2].trim();
  }
  console.log('\n * dump at: ' + line);
  for (let i = 0; i < arguments.length; i++) {
    console.log('\n' + i + ' ' + util.inspect(arguments[i], true, 10, true) + '\n');
  }
};