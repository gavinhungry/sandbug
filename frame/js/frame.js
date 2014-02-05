(function() {
  'use strict';

  // nothing to see here
  if (parent === self) {
    window.location = '//' + location.hostname.replace(/^frame\./, '');
    return;
  }

  requirejs.config({
    paths: {
      jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
      underscore: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
      string: '//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min',

      marked: '//cdnjs.cloudflare.com/ajax/libs/marked/0.3.1/marked.min',
      jade: '//cdnjs.cloudflare.com/ajax/libs/jade/1.1.5/jade.min',
      haml: '//cdnjs.cloudflare.com/ajax/libs/clientside-haml-js/5.4/haml.min',
      less: '//cdnjs.cloudflare.com/ajax/libs/less.js/1.6.2/less.min',
      sass: '//cdnjs.cloudflare.com/ajax/libs/sass.js/0.2.0/sass.min',
      traceur: '/js/lib/compilers/traceur.min',
      traceur_api: '/js/lib/compilers/traceur-api',
      coffeescript: '//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min',
      'typescript-api': '//cdnjs.cloudflare.com/ajax/libs/typescript/0.9.5/typescript.min',
      typestring: '/js/lib/compilers/typestring',
      gorillascript: '//cdnjs.cloudflare.com/ajax/libs/gorillascript/0.9.10/gorillascript.min'
    },

    shim: {
      string: { deps: ['underscore'], exports: '_.str' },

      haml: { exports: 'haml' },
      traceur: { exports: 'traceur' },
      'typescript-api': { exports: 'TypeScript' },
    }
  });

  require(['jquery', 'underscore', 'compiler'], function($, _, compiler) {
    $(function() {
      var $frame = $('#frame');

      $(window).on('message', function(e) {
        var oe = e.originalEvent;
        if (!oe.origin) { return; }

        // send ack to parent frame
        oe.source.postMessage(oe.data.timestamp, oe.origin);

        // clear the current document
        $frame.attr('srcdoc', '').removeAttr('srcdoc');

        compiler.compile_to_doc_str(oe.data.map).done(function(str) {
          _.defer(function() {
            var doc = $frame[0].contentDocument;

            doc.open();
            doc.write(str);
            doc.close();
          });
        });
      });
    });
  });
})();
