/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';
  window._debugger_io_require('../', true);

  require(['jquery', 'underscore', 'jasmine', '../test/matchers'],
  function($, _, jasmine, matchers) {
    var env = jasmine.getEnv();
    env.addReporter(new jasmine.HtmlReporter());

    var specs = _.map([
      'config', 'utils'
    ], function(module) {
      return _.sprintf('../test/spec/%s_spec', module);
    });

    $(function() {
      matchers.addMatchers();

      require(specs, function() {
        env.execute();
      });
    });

  });
})();
