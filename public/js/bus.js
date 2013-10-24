/*
 * debugger.io: An interactive web scripting sandbox
 *
 * bus.js: Backbone event bus
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone'
],
function(config, utils, $, _, Backbone) {
  'use strict';

  var bus = utils.module('bus', _.clone(Backbone.Events));

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

  /**
   * Remove all event handlers for a given context
   *
   * @param {Object} context - context to have events removed
   * @return {Object} event bus
   */
  bus.off_for = function(context) {
    if (_.isUndefined(this._events)) { return this; }

    this.off(null, null, context);

    return this;
  };

  /**
   * Enable an event only after disabling other events wih the same name
   *
   * @param {String} event - event name
   * @param {Function} [callback] - callback function for event
   * @param {Object} [context] - context for event callback
   * @return {Object} event bus
   */
  bus.only = function(event, callback, context) {
    if (_.isUndefined(this._events)) { return this; }

    this.off(event);
    this.on(event, callback, context);

    return this;
  };

  $(window).on('resize', function() {
    bus.trigger('window:resize');
  });

  return bus;
});
