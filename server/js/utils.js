/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'underscore', 'q',
  'http', 'https'
],
function(
  module, path, _, Q,
  http, https
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var utils = {};

  /**
   * Log messages to console
   *
   * @param {Mixed} - messages to log
   */
  utils.log = function() {
    var args = _.toArray(arguments);
    args.unshift('==>');
    console.log.apply(console, args);
  };

  /**
   * Load remote JSON
   *
   * @param {Object} opts - options to http.get
   * @return {Promise} promise to return JSON
   */
  utils.get_JSON = function(opts) {
    var d = Q.defer();

    var protocol = (opts.port === 443) ? https : http;

    protocol.get(opts, function(res) {
      var datas = [];
      res.on('data', function (data) { datas.push(data); });
      res.on('end', function() {
        try {
          var result = JSON.parse(datas.join(''));
          d.resolve(result);
        } catch(err) { d.reject(err); }
      });
    }).on('error', d.reject);

    return d.promise;
  };

  /**
   * Ensure that a value is an array
   *
   * @param {Mixed} value
   * @return {Array}
   */
  utils.ensure_array = function(value) {
    if (value === undefined || value === null) { return []; }
    return _.isArray(value) ? value : [value];
  };

  /**
   * Ensure that a value is a string
   *
   * @param {Mixed} value
   * @return {String}
   */
  utils.ensure_string = function(value) {
    if (_.isObject(value)) { return ''; }
    return _.isString(value) ? value : (value ? value + '' : '');
  };

  /**
   * Reduce a period-delimited string to an object
   *
   * @param {String} str - eg. 'module.run_method'
   * @param {Object} [base] - base object to start from, defaults to `global`
   * @return {Object} eg. `global.module.run_method`
   */
  utils.reduce = function(str, base) {
    base = base || global;
    if (!str || !_.isString(str)) { return base; }

    return _.reduce(str.split('.'), function(obj, prop) {
      return obj ? obj[prop] : null;
    }, base);
  };

  /**
   * Create a promise that resolves to a value now
   *
   * @param {Mixed} value - value that the promise will resolve to
   * @return {Promise} promise to return value
   */
  utils.resolve_now = function(value) {
    var d = Q.defer();
    d.resolve(value);
    return d.promise;
  };

  /**
   * Create a promise that rejects to a value now
   *
   * @param {Mixed} value - value that the promise will reject to
   * @return {Promise} promise to return value
   */
  utils.reject_now = function(value) {
    var d = Q.defer();
    d.reject(value);
    return d.promise;
  };

  /**
   * Send a server error to a client
   *
   * @param {express.response} res - Express HTTP response
   * @param {Object} [err]
   */
  utils.server_error = function(res, err) {
    if (err) { console.error(err); }

    if (!res || !res.status) { return; } // !(res instanceof express.response)
    res.status(500).json(new utils.LocaleMsg('server_error'));
  };

  /**
   * Return a handler to send a server error to a client
   *
   * @param {express.response} res - Express HTTP response
   * @return {Function}
   */
  utils.server_error_handler = function(res) {
    return function() { utils.server_error(res); };
  };

  /**
   * Constructor for client messages, which consist of a localizable template
   * string ID and optional data to fill the string
   *
   * @param {String} id - localizable template string ID
   * @param {Array} [data] - data to fill template string on client
   */
  utils.LocaleMsg = function(id, head_args, msg_args) {
    this.set_id(id);
    this.args = {};

    this.set_head_args(head_args);
    this.set_msg_args(msg_args);
  };

  utils.LocaleMsg.prototype = {
    set_id: function(id) { this.localize = id; return this; },
    set_head_args: function(args) {
      if (args && args.length) {
        this.args.head = utils.ensure_array(data);
      } else { delete this.args.head; }
      return this;
    },
    set_msg_args: function(args) {
      if (args && args.length) {
        this.args.msg = utils.ensure_array(data);
      } else { delete this.args.msg; }
      return this;
    }
  };

  /**
   * Determing the age of a Unix timestamp
   *
   * @param {Number | String} timestamp - a Unix timestamp
   * @return {Number} seconds since `timestamp` occurred
   */
  utils.timestamp_age = function(timestamp) {
    var then = parseInt(timestamp, 10);
    var now = utils.timestamp_now();

    var diff = now - then;

    return _.isNaN(diff) ? Math.POSITIVE_INFINITY : diff;
  };

  /**
   * Return the current Unix timestamp
   *
   * @return {Number} current Unix timestamp
   */
  utils.timestamp_now = function() {
    return Math.floor(Date.now() / 1000);
  };

  return utils;
});
