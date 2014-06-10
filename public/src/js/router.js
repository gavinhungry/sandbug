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

  /**
   * Keep a record of the previous routes
   */
  var buffer_route = function(route) {
    route = _.isString(route) ? route : Backbone.history.fragment;
    if (_.last(prev_routes.get()) === route) { return; }

    prev_routes.buf(route);
  };

  var Router = Backbone.Router.extend({
    routes: {
      '': function() { /* nop */ },
      'login': function() { popups.popup('login'); },
      'logout': function() { user.logout(); },
      'signup': function() { popups.popup('signup'); },
      'bugs/:bugslug': function(bugslug) { bugs.open(bugslug); }
    }
  });

  var router = utils.module('router', new Router());

  bus.init(function(av) {
    router.console.log('init router module');

    Backbone.history.start({ pushState: true });
    buffer_route();
  });

  bus.on('navigate', function(route, trigger) {
    route = route === 'back' ? router.previous_route() : route;

    buffer_route(route);
    router.navigate(route, { trigger: trigger });
  });

  /**
   * Return to the previous route
   */
  router.previous_route = function() {
    var routes = _.without(prev_routes.get(), Backbone.history.fragment);
    return _.last(routes) || '';
  };

  return router;
});
