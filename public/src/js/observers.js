/*
 * debugger.io: An interactive web scripting sandbox
 *
 * observers.js: mutation observers
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  // ---

  var observers = utils.module('observers');

  var listeners = {};
  var last_lid = 0;

  var MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver;

  bus.init(function(av) {
    observers.console.log('init observers module');

    var observer = new MutationObserver(function(mutations) {
      // pass each mutation
      _.each(mutations, function(mutation) {
        // to each listener function
        _.each(listeners, function(listener) { listener(mutation); });
      });
    });

    observer.observe(document, { childList: true, subtree: true });
  });

  /**
   * Register a new observer listener function
   *
   * @param {Function} callback - listener function, passed MutationRecord
   * @return {Integer} unique listener id
   */
  observers.register_listener = function(callback) {
    if (!_.isFunction(callback)) { return; }

    var lid = last_lid++;

    observers.console.log('registering observer listener', lid);
    listeners[lid] = callback;

    return lid;
  };

  /**
   * Unregister an observer listener by id
   *
   * @param {Integer} lid - listener id
   */
  observers.unregister_listener = function(lid) {
    if (_.has(listeners, lid)) {
      observers.console.log('unregistering observer listener', lid);
      delete listeners[lid];
    }
  };

  return observers;
});
