/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * keys.js: key-command handlers
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var keys = utils.module('keys');

  var handlers = {};
  var last_hid = 0;
  var initialized = false;

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
      e.preventDefault();
      e.stopPropagation();

      var key_handlers = _.filter(handlers, function(h) {
        return h.ctrl === e.ctrlKey && h.alt === e.altKey && h.key === e.which;
      });

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
   * @param {String} key: single-char or key description
   * @return {Integer | null}: char code if found, null otherwise
   */
  keys.key_code_for = function(key) {
    if (!_.isString(key)) { return null; }
    if (key.length === 1) { return key.toUpperCase().charCodeAt(0); }
    switch(key) {
      case 'enter': return 13; break;
      case 'left':  return 37; break;
      case 'up':    return 38; break;
      case 'right': return 39; break;
      case 'down':  return 40; break;
    }

    return null;
  };

  /**
   * Register a new key callback function
   *
   * @param {Map} opts: { ctrl: Boolean, alt: Boolean, key: String }
   * @param {Function} callback: callback function, passed up event
   * @return {Integer}: unique handler id
   */
  keys.register_handler = function(opts, callback) {
    var opts = opts || {};
    var hid = last_hid++;
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
   * @param {Integer} hid: handler id
   */
  keys.unregister_handler = function(hid) {
    utils.log('unregistering key handler', hid);
    delete handlers[hid];
  };

  return keys;
});
