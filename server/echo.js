/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define(['module', 'path', 'express', 'consolidate', 'underscore'],
function(module, path, express, cons, _) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var echo = {};

  // Express server
  echo.server = express();
  echo.port = 8081;

  // use Underscore templates
  echo.server.engine('html', cons.underscore);
  echo.server.set('view engine', 'html');
  echo.server.set('views', __dirname + '/templates');

  echo.server.use(express.bodyParser());

  echo.server.post('/frame', function(req, res) {
    res.setHeader('X-XSS-Protection', '0');

    res.render('frame', {
      markup: req.body.markup,
      style: req.body.style,
      script: req.body.script
    });
  });

  return echo;
});
