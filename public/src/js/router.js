/*
 * debugger.io: An interactive web scripting sandbox
 *
 * router.js: Backbone router
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone = require('backbone');
  var bugs     = require('bugs');
  var user     = require('user');

  // ---

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
