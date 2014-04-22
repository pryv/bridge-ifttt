var extras = require('../assets/event-extras.json');
//var eventTypes = require('../assets/event-types.json');

var dataTypesUtils =  require('../assets/data-types-utils.js');

var compiledSets = {};


function buildFromSets(compiledSetKey, selectedSets) {

  var typesListUnordered = {};

  selectedSets.forEach(function (setKey) {
    if (! extras.sets[setKey]) {
      throw new Error('Cannot find set: ' + setKey);
    }
    var types = extras.sets[setKey].types;
    Object.keys(types).forEach(function (typeKey) {
      var typeName = null;
      var extrasData = extras.extras[typeKey];
      if (extrasData && extrasData.name) {
        typeName = extrasData.name.en;
      }
      typeName = typeName || typeKey;


      types[typeKey].forEach(function (formatKey) {

        var res = dataTypesUtils.nameAndSymbolForKeys(typeKey, formatKey);

        var formatName = res[0];
        var formatSymbol = res[1];
        if (formatSymbol) {
          formatSymbol = ' (' + formatSymbol + ')';
        } else {
          formatSymbol = '';
        }

        var formatLabel = typeName + ' - ' + formatName +  formatSymbol;

        typesListUnordered[formatLabel] = typeKey + '/' + formatKey;

      });
    });
  });

  var typesListData = [];
  Object.keys(typesListUnordered).sort().forEach(function (typeLabel) {
    typesListData.push({label: typeLabel, value: typesListUnordered[typeLabel]});
  });

  compiledSets[compiledSetKey] = {data : typesListData};



}



buildFromSets('basic', ['basic-measurements-metric',
  'basic-measurements-imperial', 'basic-measurements-us']);
buildFromSets('common', ['generic-measurements-metric',
  'generic-measurements-imperial', 'generic-measurements-us']);

// TODO money & all

exports.basic = function (req, res /*, next*/) {
  res.json(compiledSets.basic);
};

exports.common = function (req, res /*, next*/) {
  res.json(compiledSets.basic);
};