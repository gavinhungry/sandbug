/*
 * debugger.io: An interactive web scripting sandbox
 */

define(['module', 'path', 'express', 'consolidate', 'underscore'],
function(module, path, express, cons, _) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var frame = {};

  // Express server
  frame.server = express();
  frame.port = 8081;

  // use Underscore templates
  frame.server.engine('html', cons.underscore);
  frame.server.set('view engine', 'html');
  frame.server.set('views', __dirname + '/templates');

  frame.server.use(express.bodyParser());

  frame.server.post('/', function(req, res) {
    res.setHeader('X-XSS-Protection', '0');

    res.render('frame', {
      markup: req.body.markup,
      style: req.body.style,
      script: req.body.script
    });
  });

  return frame;
});
