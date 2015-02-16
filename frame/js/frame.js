/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  // nothing to see here
  if (parent === self) {
    window.location = '//' + location.hostname.replace(/^frame\./, '');
    return;
  }

  requirejs.config({
    paths: {
      jquery: '//cdn.jsdelivr.net/jquery/2.1/jquery.min',
      underscore: '//cdn.jsdelivr.net/lodash/3.0/lodash.min',
      string: '//cdn.jsdelivr.net/underscore.string/3.0/underscore.string.min',

      marked: '//cdn.jsdelivr.net/marked/0.3/marked.min',
      jade: '//cdn.jsdelivr.net/jade/1.3/jade.min',
      haml: '//cdn.jsdelivr.net/clientside-haml-js/5.4/haml.min',
      less: '//cdn.jsdelivr.net/less/2.2/less.min',
      sass: '//cdn.jsdelivr.net/sass.js/0.3/sass.min',
      traceur: '/js/lib/compilers/traceur.min',
      traceur_api: '/js/lib/compilers/traceur-api.min',
      coffeescript: '//cdn.jsdelivr.net/coffeescript/1.7/coffee-script.min',
      'typescript-api': '//cdn.jsdelivr.net/typescript/1.0/typescript.min',
      typestring: '//cdn.jsdelivr.net/typestring/1.0/typestring.min',
      gorillascript: '//cdn.jsdelivr.net/gorillascript/0.9/gorillascript.min',
      diffdom: '//cdn.jsdelivr.net/diffdom/0.0/diffdom.min'
    },

    shim: {
      string: { deps: ['underscore'], exports: '_.str' },

      haml: { exports: 'haml' },
      traceur: { exports: 'traceur' },
      'typescript-api': { exports: 'TypeScript' },
    }
  });

  require(['jquery', 'underscore', 'compiler', 'diffdom'],
    function($, _, compiler) {
    $(function() {

      var origin, source, win;
      var dd = new diffDOM();

      var frame_selector = '#frame';
      var reset_frame = function() {
        var $elem = $(frame_selector).first();
        if (!$elem.length) { return $(); }

        $elem.replaceWith($elem[0].outerHTML);
        return $(frame_selector).first();
      };

      // ouput console to input
      $(window).on('console', function(e) {
        var data = e.originalEvent.detail;

        if (!source || !origin) { return; }

        var msg = {
          action: 'console',
          timestamp: data.timestamp,
          time: data.time,
          type: data.type,
        };

          // we can't postMessage any data that is not stringify-able
        msg.args = _.map(data.args, function(arg) {
          if (arg instanceof win.Error) {
            msg.type = 'error';
            return arg.toString();
          }

          try {
            JSON.parse(JSON.stringify(arg));
            return arg;
          } catch(err) {

            if (typeof arg.toString === 'function') {
              return arg.toString();
            }

            return toString.call(arg);
          }
        });

        source.postMessage(msg, origin);
      });

      // input to output
      $(window).on('message', function(e) {
        var oe = e.originalEvent;
        if (!oe.origin || !_.has(oe.data, 'timestamp')) { return; }

        origin = oe.origin;
        source = oe.source;

        // send ack to parent frame
        source.postMessage({
          action: 'ack',
          timestamp: oe.data.timestamp
        }, origin);

        // live-update of CSS only
        if (win && oe.data.css) {
          var $style = $(win.document).find('#_debugger_io_style_output');

          // build the entire document as usual if no existing style is found
          if ($style.length) {

            compiler.compile(oe.data.map.style).then(function(compiled) {
              $style.text(compiled.output);
            });

            return;
          }
        }

        if (oe.data.patch) {

          compiler.compile(oe.data.map.markup).then(function(html) {

            var $body = $(frame_selector).first().contents().find('body');
            var $clone = $body.clone().html(html.output);

            var diff = dd.diff($body[0], $clone[0]);
            dd.apply($body[0], diff);
          });

        } else {
          compiler.compile_to_doc_str(oe.data.map).done(function(str) {
            _.defer(function() {

              // reset the iframe and get the new document
              var frame = reset_frame()[0];
              if (!frame) { return; }

              win = frame.contentWindow;
              var doc = frame.contentDocument;

              doc.open();
              doc.write(str);
              doc.close();
            });
          });
        }


      });
    });
  });
})();
