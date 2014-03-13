var util = require('util');


exports.inspect = function inspect() {
  var line = '';
  try {
    throw new Error();
  } catch (e) {
    line = e.stack.split(' at ')[2].trim();
  }
  util.print('\n * dump at: ' + line);
  for (var i = 0; i < arguments.length; i++) {
    util.print('\n' + i + ' ' + util.inspect(arguments[i], true, 10, true) + '\n');
  }
}