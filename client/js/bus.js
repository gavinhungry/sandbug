/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * bus.js: Backbone event bus
 */

define(['jquery', 'underscore', 'backbone', 'config', 'utils'],
function($, _, Backbone, config, utils) {
  'use strict';

  var bus = utils.module('bus', _.extend({}, Backbone.Events));

  /**
   * Turn off all events in a colon-delimited namespace (eg. namespace:event)
   *
   * @param {String} namespace - namespace to turn off events
   * @param {Function} [callback] - only turn off events firing callback
   * @param {Object} [context] - only turn off events bound to context
   * @return {Object} event bus
   */
  bus.off_ns = function(namespace, callback, context) {
    if (_.isUndefined(this._events)) { return this; }

    var ns_events = _.filter(_.keys(this._events), function(key) {
      return _.startsWith(key, namespace + ':');
    });

    _.each(ns_events, function(event) {
      this.off(event, callback, context);
    }, this);

    return this;
  };

  return bus;
});
