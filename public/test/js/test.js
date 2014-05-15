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
        jasminejs: '//cdn.jsdelivr.net/jasmine/2.0.0/jasmine',
        jasmine_html: '//cdn.jsdelivr.net/jasmine/2.0.0/jasmine-html',
        jasmine_boot: '//cdn.jsdelivr.net/jasmine/2.0.0/boot',
        jasmine_jquery: '//cdn.jsdelivr.net/jasmine.jquery/2.0/jasmine-jquery.min',

        jasmine: TEST + '/js/libs/jasmine',
        matchers: TEST + '/js/matchers'
      },

      shim: {
        jasminejs: { exports: 'jasmine' },
        jasmine_html: { deps: ['jasminejs'] },
        jasmine_boot: { deps: ['jasminejs', 'jasmine_html'] },
        jasmine_jquery: { deps: ['jquery', 'jasmine'] }
      }
    });

    require(['jquery', 'underscore', 'jasmine', 'matchers'],
    function($, _, jasmine, matchers) {

      var specs = _.map([
        'config', 'utils'
      ], function(module) {
        return _.sprintf('%s/spec/%s_spec', TEST, module);
      });

      $(function() {
        require(specs, function() {
          matchers.addMatchers();
          jasmine.onJasmineLoad();
        });
      });
    });
  });

})();
