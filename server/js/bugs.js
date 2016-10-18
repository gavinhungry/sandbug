/*
 * sandbug: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var auth     = require('auth');
  var db       = require('db');
  var Q        = require('q');
  var Rudiment = require('rudiment');
  var schema   = require('js-schema');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var bugs = {};

  bugs.crud = new Rudiment({
    db: db.raw.bugs,
    key: 'slug',
    path: 'bug',
    schema: [schema({
      username: [null, String],
      origin: [null, String.of(128, null)],

      slug: String.of(0, 128, null),
      title: String.of(0, 128, null),

      created: Date,
      updated: Date,
      updater: [null, String], // same as username

      'private': Boolean,
      // collaborators: Array, // of Strings passing auth.is_valid_username

      map: {
        markup: {
          mode: ['htmlmixed', 'gfm', 'jade', 'haml'],
          content: String
        },

        style: {
          mode: ['css', 'less', 'scss'],
          content: String
        },

        script: {
          mode: ['javascript', 'traceur', 'coffeescript', 'typescript', 'gorillascript'],
          content: String
        }
      }
    }), function(bug) {
      if (_.isString(bug.username)) {
        if (!auth.is_valid_username(bug.username)) {
          return false;
        }

        if (auth.sanitize_username(bug.username) !== bug.username) {
          return false;
        }
      }

      if (_.isString(bug.updater)) {
        if (!auth.is_valid_username(bug.updater)) {
          return false;
        }

        if (auth.sanitize_username(bug.updater) !== bug.updater) {
          return false;
        }
      }

      if (_.str.slugify(bug.slug) !== bug.slug) {
        return false;
      }

      if (_.keys(bug.map).length !== 3) {
        return false;
      }

      if (_.some(_.keys(bug.map), function(key) {
        return _.keys(bug.map[key]).length !== 2;
      })) {
        return false;
      }

      return true;
    }],

    out: function(bug) {
      delete bug._id;
      bug._fetched = Date.now();
    }
  });

  return bugs;
});
