/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth', 'db', 'mongoose'
],
function(
  module, path, config, utils, _, Q,
  auth, db, mongoose
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
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
        username: { type: String, filter: sanitize_username },
        slug: { type: String, filter: _.slugify, default: random_slug },
        title: { type: String, default: 'Bug' },

        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now },

        secret: { type: Boolean, default: false },
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

        _.chain(bugSchema.paths).filter(function(key) {
          return _.first(key.path) !== '_';
        }).each(function(key) {

          var split = key.path.split('.');
          var last = split.pop();
          var base = utils.reduce(split.join('.'), model);

          // use first enum value as default
          if (key.enumValues && key.enumValues.length &&
            !_.contains(key.enumValues, model[key.path])) {
              base[last] = _.first(key.enumValues);
          }

          // allow for a filter function on strings
          if (key.options.type === String && _.isFunction(key.options.filter)) {
             base[last] = key.options.filter(model[key.path]);
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
      return new bugs.Bug(opts);
    });
  };

  /**
   * Get a bug from a username and slug
   *
   * @param {String} username - username for a bug
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} to return a bug, or false if no matching result found
   */
  bugs.get_by_slug = function(username, bugslug) {
    username = auth.sanitize_username(username);
    bugslug = _.slugify(bugslug);

    return db.get_bug_by_slug(username, bugslug);
  };

  return bugs;
});
