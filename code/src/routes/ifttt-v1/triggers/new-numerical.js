const generic = require('./new-event-generic');

const slug = 'new-numerical';
const dataTypesHandlers = require('../../../fields/data-type');

const dataTypesUtils =  require('../../../assets/data-types-utils.js');

module.exports = function setup(app) {

  generic.addOption(app, 'eventType', slug, dataTypesHandlers.basic);

  generic.setup(app, slug,
    function (triggerFields) { //--- dataType
      if (
        triggerFields.eventType != null && 
        typeof triggerFields.eventType === 'string') {
        return [triggerFields.eventType];
      }
      return null;
    },
    function (event, map) {
      map.Value = event.content;
      const res = dataTypesUtils.nameAndSymbolForDataType(event.type);

      map.UnitName = res[0];
      map.UnitSymbol = res[1] || '';
    });
};

