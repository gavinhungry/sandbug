/*
 * debugger.io: An interactive web scripting sandbox
 */

define(['module', 'path', 'express', 'consolidate', 'underscore'],
function(module, path, express, cons, _) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var frame = {};

  // Express server
  var server = express();
  frame.port = 8081;

  frame.start = function() {
    server.listen(frame.port);
  };

  // use Underscore templates
  server.engine('html', cons.underscore);
  server.set('view engine', 'html');
  server.set('views', __dirname + '/templates');

  server.use(express.bodyParser());

  server.post('/', function(req, res) {
    res.setHeader('X-XSS-Protection', '0');

    res.render('frame', {
      markup: req.body.markup,
      style: req.body.style,
      script: req.body.script
    });
  });

  return frame;
});
