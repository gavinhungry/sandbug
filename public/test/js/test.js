/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var SRC = '../../src';
  var TEST = '../../test'; // relative to SRC

  require([SRC + '/js/require.config'], function() {
    requirejs.config({
      baseUrl: SRC + '/js',
      urlArgs: ('v=' + (new Date()).getTime()),

      paths: {
        jasminejs: 'http://cdn.jsdelivr.net/jasmine/1.3.1/jasmine',
        jasmine_html: 'http://cdn.jsdelivr.net/jasmine/1.3.1/jasmine-html',
        jasmine_jquery: TEST + '/js/plugins/jasmine-jquery.min',

        jasmine: TEST + '/js/libs/jasmine',
        matchers: TEST + '/js/matchers'
      },

      shim: {
        jasminejs: { exports: 'jasmine' },
        jasmine_html: { deps: ['jasminejs'] },
        jasmine_jquery: { deps: ['jasminejs', 'jquery'] }
      }
    });

    require(['jquery', 'underscore', 'jasmine', 'matchers'],
    function($, _, jasmine, matchers) {
      var env = jasmine.getEnv();
      env.addReporter(new jasmine.HtmlReporter());

      var specs = _.map([
        'config', 'utils'
      ], function(module) {
        return _.sprintf('%s/spec/%s_spec', TEST, module);
      });

      $(function() {
        matchers.addMatchers();

        require(specs, function() {
          env.execute();
        });
      });
    });
  });

})();
