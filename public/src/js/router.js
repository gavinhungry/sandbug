/*
 * debugger.io: An interactive web scripting sandbox
 *
 * router.js: Backbone router
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bugs', 'bus', 'popups', 'user'
],
function(config, utils, $, _, Backbone, bugs, bus, popups, user) {
  'use strict';

  var prev_routes = new utils.Buffer(4);

  var buffer_route = function() {
    prev_routes.buf(Backbone.history.fragment);
  };

  var Router = Backbone.Router.extend({
    initialize: function() {
      this.on('route', buffer_route);
    },

    routes: {
      'login': function() { popups.popup('login'); },
      'logout': user.logout,
      'signup': function() { popups.popup('signup'); },
      'bugs/:bugslug': function(bugslug) {
        bugs.display_by_slug(null, bugslug);
      },
      'users/:username/bugs/:bugslug': bugs.display_by_slug
    }
  });

  var router = utils.module('router', new Router());

  bus.init(function(av) {
    utils.log('init router module');

    Backbone.history.start({ pushState: true });
    buffer_route();
  });

  return router;
});
