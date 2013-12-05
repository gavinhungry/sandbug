/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q',
  'compilers', 'consolidate', 'express'
  ],
function(
  module, path, config, utils, _, Q,
  compilers, cons, express
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var frame = {};

  // Express server
  var server = express();
  frame.port = config.ports.frame;

  frame.start = function() {
    server.listen(frame.port);
  };

  // use Underscore templates
  server.engine('html', cons.underscore);
  server.set('view engine', 'html');
  server.set('views', __dirname + '/templates');

  // server.use(express.bodyParser());
  server.use(express.urlencoded());
  server.use(express.json());

  // development: serve all static content via Node
  // server.use(express.static(__dirname + '/static'));

  server.post('/', function(req, res) {
    res.setHeader('X-XSS-Protection', '0');
    var data = req.body;

    Q.all([
      compilers.compile(data.markup_mode, data.markup),
      compilers.compile(data.style_mode,  data.style),
      compilers.compile(data.script_mode, data.script)
    ]).done(function(output) {
      res.render('frame', {
        markup: output[0],
        style: output[1],
        script: output[2],
        mode: {
          markup: data.markup_mode,
          style: data.style_mode,
          script: data.script_mode
        }
      });
    });
  });

  return frame;
});
