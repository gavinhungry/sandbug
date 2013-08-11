#!/usr/bin/env node

/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * server.js: Node.js server
 */

(function() {
  var _ = require('underscore');
  var cons = require('consolidate');
  var express = require('express');
  var routes = require('./routes');

  var jsbyte = express(), echo = express();
  jsbyte.use(express.static(__dirname + '/public'));

  _.each([jsbyte, echo], function(app) {
    // use Underscore templates
    app.engine('html', cons.underscore);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/templates');

    app.use(express.bodyParser());
  });

  echo.post('/', routes.echo);

  jsbyte.listen(8080);
  echo.listen(8081);
})();
