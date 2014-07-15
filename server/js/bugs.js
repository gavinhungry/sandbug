/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var auth     = require('auth');
  var db       = require('db');
  var mongoose = require('mongoose');
  var Q        = require('q');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var bugs = {};

  var mongoose_p = (function() {
    var d = Q.defer();

    mongoose.connect(db.dsn).connection
    .once('error', d.reject)
    .once('open', function() {

      var sanitize_username = function(str) {
        return auth.sanitize_username(str) || null;
      };

      var random_slug = function() {
        return '4'; // FIXME
      };

      var bugSchema = mongoose.Schema({
        slug: {
          type: String,
          filter: _.slugify,
          default: random_slug,
          index: { unique: true }
        },

        username: { type: String, filter: sanitize_username },
        title: { type: String, default: 'Bug' },

        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now },

        autorun: { type: Boolean, default: false },
        'private': { type: Boolean, default: false },
        collaborators: { type: [String], default: [] },

        map: {
          markup: {
            mode: { type: String, enum: ['htmlmixed', 'gfm', 'jade', 'haml'] },
            content: { type: String, default: '' }
          },

          style: {
            mode: { type: String, enum: ['css', 'less', 'scss'] },
            content: { type: String, default: '' }
          },

          script: {
            mode: {
              type: String,
              enum: [
                'javascript', 'traceur', 'coffeescript', 'typescript',
                'gorillascript'
              ]
            },
            content: { type: String, default: '' }
          }
        }
      });

      bugSchema.pre('validate', function(next) {
        var model = this;

        model.updated = Date.now();

        _.chain(bugSchema.paths).filter(function(key) {
          return _.first(key.path) !== '_';
        }).each(function(key) {

          var split = key.path.split('.');
          var last = split.pop();
          var base = utils.reduce(split.join('.'), model);
          var value = utils.reduce(key.path, model);

          // use first enum value as default
          if (key.enumValues && key.enumValues.length &&
            !_.contains(key.enumValues, value)) {
              base[last] = _.first(key.enumValues);
          }

          // allow for a filter function on strings
          if (key.options.type === String && _.isFunction(key.options.filter)) {
             base[last] = key.options.filter(value);
          }
        });

        next();
      });

      bugs.Bug = mongoose.model('bug', bugSchema);

      d.resolve();
    });

    return d.promise;
  })();

  /**
   * Create a new bug
   *
   * @param {Object} [opts] - options to model constructor
   * @return {Promise} to return an instance of a Bug model
   */
  bugs.new_bug = function(opts) {
    opts = opts || {};

    return mongoose_p.then(function() {
      opts.slug = opts.slug || opts._slug;
      delete opts._slug;

      return new bugs.Bug(opts);
    });
  };

 /**
   * Get the Mongoose model of a bug from a slug
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} to return a bug model, or null if no result
   */
  bugs.get_model_by_slug = function(bugslug) {
    var d = Q.defer();
    bugslug = _.slugify(bugslug);

    bugs.Bug.findOne({ slug: bugslug }, function(err, bug) {
      if (err || !bug) { d.resolve(null); }
      d.resolve(bug);
    });

    return d.promise;
  };

  /**
   * Get a bug from a slug
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} to return a bug, or null if no result
   */
  bugs.get_by_slug = function(bugslug) {
    return bugs.get_model_by_slug(bugslug).then(function(bug) {
      return bug ? bug.toObject() : null;
    });
  };

  /**
   * Ensure an argument is a bug, or resolve to a new bug
   *
   * @param {Mixed} bug
   * @return {Promise} to resolve to the passed bug or a new bug
   */
  bugs.ensure_bug = function(bug) {
    return bug instanceof bugs.Bug ? Q.when(bug) : bugs.new_bug();
  };

  return bugs;
});
