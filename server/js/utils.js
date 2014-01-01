/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'underscore', 'q',
  'http', 'https', 'validator'
],
function(
  module, path, _, Q,
  http, https, validator
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
        var result = JSON.parse(datas.join(''));
        d.resolve(result);
      });
    }).on('error', function(err) {
      d.reject(err);
    });

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
   * Create a promise that resolves to a value now
   *
   * @param {Mixed} value - value that the promise will resolve to
   * @return {Promise} promise to return value
   */
  utils.promise_now = function(value) {
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
   * Constructor for client messages, which consist of a localizable template
   * string ID and optional data to fill the string
   *
   * @param {String} id - localizable template string ID
   * @param {Array} [data] - data to fill template string on client
   */
  utils.ClientMsg = function(id, data) {
    this.set_id(id);
    this.set_data(data);
  };

  utils.ClientMsg.prototype = {
    set_id: function(id) { this.localize = id; },
    set_data: function(data) { this.data = utils.ensure_array(data); }
  };

  /**
   * Determing the age of a Unix timestamp
   *
   * @param {Number | String} timestamp - a Unix timestamp
   * @return {Number} ms since `timestamp` occurred
   */
  utils.timestamp_age = function(timestamp) {
    var then = parseInt(timestamp, 10);
    var now = new Date().getTime();

    var diff = now - then;

    return _.isNaN(diff) ? Math.POSITIVE_INFINITY : diff;
  };

  /**
   * Clean up a potential username string
   *
   * @param {String} username - a string to treat as username input
   * @return {String} username with only alphanumeric characters and underscores
   */
  utils.sanitize_username = function(username) {
    username = utils.ensure_string(username).toLowerCase();
    return username.replace(/[^a-z0-9_]/ig, '');
  };

  /**
   * Test for a valid username
   *
   * @param {String} username - a string to treat as username input
   * @return {Boolean} true if username is valid, false otherwise
   */
  utils.is_valid_username = function(username) {
    return utils.sanitize_username(username) ===
      username && username.length >= 3;
  };

  /**
   * Test for a valid email address
   *
   * @param {String} email - a string to treat as email address input
   * @return {Boolean} true if email is valid, false otherwise
   */
  utils.is_valid_email = function(email) {
    try {
      validator.check(email).isEmail();
    } catch(e) {
      return false;
    }

    return true;
  };

  /**
   * Test for a valid password
   *
   * The only requirements for a valid password are that it must contain at
   * least one non-whitespace character, be at least 4 characters and at most
   * 500 characters.  Users are free to shoot themselves in the foot.
   *
   * @param {String} plaintext - a string to treat as password input
   * @return {Boolean} true if password is valid, false otherwise
   */
  utils.is_valid_password = function(plaintext) {
    return _.isString(plaintext) && /^(?=.*\S).{4,500}$/.test(plaintext);
  };

  return utils;
});
