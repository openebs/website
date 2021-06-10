const path = require('path');

module.exports = function (context, options) {
    return {
      name: 'route-update-event-plugin',
      getClientModules() {
        return [path.resolve(__dirname, './route-update')];
      }
    };
  };