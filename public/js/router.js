/*
 * debugger.io: An interactive web scripting sandbox
 *
 * router.js: Backbone router
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus'],
function(config, utils, $, _, Backbone, bus) {
  'use strict';

  var Router = Backbone.Router.extend({
    routes: {
      'login': 'login'
    }
  });

  var router = utils.module('router', new Router());

  /**
   * Initialize the Backbone router
   */
  router.init = function() {
    Backbone.history.start({ pushState: true });
  };

  router.on('route:login', function() {
    utils.log('login route');
  });

  return router;
});
