/*
 * debugger.io: An interactive web scripting sandbox
 *
 * keys.js: key-command handlers
 */

define(['config', 'utils', 'jquery', 'underscore'],
function(config, utils, $, _) {
  'use strict';

  var keys = utils.module('keys');

  var handlers = {};
  var last_hid = 0;
  var initialized = false;

  var key_map = {
    'enter': 13,
    'left':  37,
    'up':    38,
    'right': 39,
    'down':  40,
    '/':     191
  };

  /**
   * Start listening for key events and execute registered handlers
   */
  keys.init = function() {
    if (initialized) {
      utils.log('keys module already initialized');
      return;
    }

    utils.log('initializing keys module');

    $(document).on('keyup', function(e) {
      var key_handlers = _.filter(handlers, function(h) {
        return !h.paused && h.ctrl === e.ctrlKey && h.alt === e.altKey &&
          h.key === e.which;
      });

      if (key_handlers.length) {
        e.preventDefault();
        e.stopPropagation();
      }

      _.each(key_handlers, function(handler) {
        var callback = handler ? handler.callback : null;
        if (_.isFunction(callback)) {
          utils.log('executing callback for handler', handler.hid);
          callback(e);
        }
      });
    });

    initialized = true;
  };

  /**
   * Get a char code from a single-char
   *
   * @param {String} key - single-char or key description
   * @return {Integer | null} char code if found, null otherwise
   */
  keys.key_code_for = function(key) {
    if (!_.isString(key)) { return null; }
    if (_.has(key_map, key)) { return key_map[key]; }
    if (key.length === 1) { return key.toUpperCase().charCodeAt(0); }

    return null;
  };

  /**
   * Register a new key callback function
   *
   * @param {Map} opts - { ctrl: Boolean, alt: Boolean, key: String }
   * @param {Function} callback - callback function, passed up event
   * @return {Integer} unique handler id, null if opts.key is undefined
   */
  keys.register_handler = function(opts, callback) {
    var opts = opts || {};
    var hid = last_hid++;

    if (_.isUndefined(opts.key)) { return null; }
    utils.log('registering key handler', hid);

    handlers[hid] = {
      hid: hid,
      ctrl: !!opts.ctrl,
      alt: !!opts.alt,
      key: keys.key_code_for(opts.key),
      callback: callback
    };

    return hid;
  };

  /**
   * Unregister a key hander by id
   *
   * @param {Integer} hid - handler id
   */
  keys.unregister_handler = function(hid) {
    if (_.has(handlers, hid)) {
      utils.log('unregistering key handler', hid);
      delete handlers[hid];
    }
  };

  /**
   * Pause a key hander by id
   *
   * @param {Integer} hid - handler id
   */
  keys.pause_handler = function(hid) {
    if (_.has(handlers, hid)) {
      utils.log('pausing key handler', hid);
      handlers[hid].paused = true;
    }
  };

  /**
   * Resume a paused a key hander by id
   *
   * @param {Integer} hid - handler id
   */
  keys.resume_handler = function(hid) {
    if (_.has(handlers, hid)) {
      utils.log('resuming key handler', hid);
      handlers[hid].paused = false;
    }
  };

  /**
   * Toggle a key hander by id
   *
   * @param {Integer} hid - handler id
   */
  keys.toggle_handler = function(hid) {
    if (_.has(handlers, hid)) {
      utils.log('toggling key handler', hid);
      handlers[hid].paused = !handlers[hid].paused;
    }
  };

  return keys;
});
