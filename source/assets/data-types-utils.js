var extras = require('../assets/event-extras.json');

exports.nameAndSymbolForKeys = function nameAndSymbolForKeys(typeKey, formatKey) {

  var formatName = null;
  var formatSymbol = null;
  var extrasData = extras.extras[typeKey];
  if (extrasData.formats && extrasData.formats[formatKey] &&
    extrasData.formats[formatKey].name) {
    formatName = extrasData.formats[formatKey].name.en;
    formatSymbol = extrasData.formats[formatKey].symbol;
  }
  formatName = formatName || formatKey;


  return [formatName, formatSymbol];
};

exports.nameAndSymbolForDataType = function (dataTypeKey) {
  var s =  dataTypeKey.split('/');
  return this.nameAndSymbolForKeys(s[0], s[1]);
};