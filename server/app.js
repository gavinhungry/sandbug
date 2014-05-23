/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth', 'consolidate', 'express', 'routes',
  'connect-mobile-detection'
],
function(
  module, path, config, utils, _, Q,
  auth, cons, express, routes, mobile
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = config.ports.server;

  auth.init(server);

  app.init = function() {
    server.listen(app.port);
  };

  // connect-mobile-detection
  server.use(mobile());

  // use Underscore/Lodash templates
  server.engine('html', cons.lodash);
  server.set('view engine', 'html');
  server.set('views', __dirname + '/templates');

  // routes
  server.get('/', routes.get.index);
  server.get('/api/config', routes.get.config);
  server.post('/api/signup', routes.post.signup);
  server.post('/api/login', auth.authenticate, routes.post.login);
  server.post('/api/logout', routes.post.logout);

  server.get('/api/bugs/:bugslug', routes.get.bug);
  server.put('/api/bugs/:bugslug', routes.put.bug);
  server.post('/api/bugs/:bugslug', routes.post.bug);

  server.use(routes.get.index);

  return app;
});
