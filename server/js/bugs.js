/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var db       = require('db');
  var Q        = require('q');
  var Rudiment = require('rudiment');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var bugs = {};

  bugs.crud = new Rudiment({
    db: db.raw.bugs,
    key: 'slug',
    path: 'bug',
    map: function(bug) {
      delete bug._id;
      bug._fetched = Date.now();
    }
  });

  // FIXME: schema
  //
  //   slug: {
  //     type: String,
  //     filter: _.str.slugify,
  //     default: random_slug,
  //     index: { unique: true }
  //   },

  //   username: { type: String, filter: sanitize_username },
  //   title: { type: String, default: 'Bug' },

  //   created: { type: Date, default: Date.now },
  //   updated: { type: Date, default: Date.now },

  //   autorun: { type: Boolean, default: false },
  //   'private': { type: Boolean, default: false },
  //   collaborators: { type: [String], default: [] },

  //   map: {
  //     markup: {
  //       mode: { type: String, enum: ['htmlmixed', 'gfm', 'jade', 'haml'] },
  //       content: { type: String, default: '' }
  //     },

  //     style: {
  //       mode: { type: String, enum: ['css', 'less', 'scss'] },
  //       content: { type: String, default: '' }
  //     },

  //     script: {
  //       mode: {
  //         type: String,
  //         enum: [
  //           'javascript', 'traceur', 'coffeescript', 'typescript',
  //           'gorillascript'
  //         ]
  //       },
  //       content: { type: String, default: '' }
  //     }
  //   }

  return bugs;
});
