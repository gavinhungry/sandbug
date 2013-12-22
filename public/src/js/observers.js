/*
 * debugger.io: An interactive web scripting sandbox
 *
 * observers.js: mutation observers
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus'
],
function(
  config, utils, $, _, bus
) {
  'use strict';

  var observers = utils.module('observers');

  var listeners = {};
  var last_lid = 0;

  var MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver;

  bus.once('init', function(av) {
    utils.log('init observers module');

    var observer = new MutationObserver(function(mutations) {
      // pass each mutation
      _.each(mutations, function(mutation) {
        // to each listener function
        _.each(listeners, function(listener) {
          if (_.isFunction(listener)) { listener(mutation); }
        });
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
    var lid = last_lid++;

    utils.log('registering observer listener', lid);
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
      utils.log('unregistering observer listener', lid);
      delete listeners[lid];
    }
  };

  return observers;
});
