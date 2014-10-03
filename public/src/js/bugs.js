/*
 * debugger.io: An interactive web scripting sandbox
 *
 * bugs.js: bug actions
 */

define(function(require) {
  'use strict';

  var _ = require('underscore');

  // ---

  var bugs    = require('promise!bugs_p');
  var mirrors = require('mirrors');

  // append default schema with default mirror modes
  _.each(bugs._priv.schema.map, function(map, panel) {
    map.mode = mirrors.get_default_mode(panel);
  });

  return bugs;
});

define('bugs_p', function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone = require('backbone');
  var flash    = require('flash');
  var frame    = require('frame');
  var locales  = require('locales');
  var mirrors  = require('mirrors');
  var popups   = require('popups');

  // ---

  var bugs = utils.module('bugs');

  bus.init(function(av) {
    bugs._priv.current = {};

    bus.on('mirrors:mode', function(panel, mode, label) {
      bugs.model().set(_.sprintf('map.%s.mode', panel), mode);
    });

    bus.on('mirrors:content', function(panel, content) {
      bugs.model().set(_.sprintf('map.%s.content', panel), content);
    });
  });

  /**
   *
   */
  bugs.Bug = Backbone.DeepModel.extend({
    idAttribute: 'slug',

    initialize: function() {
      this.on('change', function() {
        this._dirty = true;
      });
    },

    isDirty: function() {
      return this._dirty;
    },

    isEmpty: function() {
      return _.every(this.get('map'), function(panel) {
        return _.isBlank(panel.content);
      });
    },

    _url: '/api/bug/',
    url: function() {
      return this._url + this.get(this.idAttribute);
    }
  });

  /**
   *
   */
  bugs.BugView = Backbone.View.extend({
    render: function() {
      var map = this.model.get('map');

      _.each(map, function(value, key) {
        mirrors.set_mode(key, value.mode);
        mirrors.set_content(key, value.content);
      });

      if (this.model.get('autorun')) { _.defer(frame.update); }

      return this.trigger('render');
    }
  });

  /**
   * Get the current (or new) bug model
   *
   * @return {bugs.Bug}
   */
  bugs.model = function() {
    if (!(bugs._priv.current.model instanceof bugs.Bug)) {
      bugs._priv.current.model = bugs.create();
    }

    return bugs._priv.current.model;
  };

  /**
   * Get the current (or new) bug view
   *
   * @return {bugs.BugView}
   */
  bugs.view = function() {
    if (!(bugs._priv.current.view instanceof bugs.BugView)) {
      bugs._priv.current.view = new bugs.BugView({ model: bugs.model() });
      utils.title();
    }

    return bugs._priv.current.view;
  };

  /**
   * Display a Bug
   *
   * @param {bugs.Bug} bug
   */
  bugs.display = function(bug) {
    utils.title(bug.get('title'));

    var bugslug = bug.get('slug');
    bus.trigger('navigate', bugslug ? ('bug/' + bugslug) : '');

    // destroy previous model
    if (bug === bugs.model()) { return; }

    // destroy previous model
    bugs.model().destroy();

    var view = new bugs.BugView({ model: bug });

    bugs._priv.current = {
      model: bug,
      view: view
    };

    view.render();
  };

  /**
   * Get a bug from the server matching a slug
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} resolving to {bugs.Bug}
   */
  bugs.get = function(bugslug) {
    var bug = new bugs.Bug({ slug: bugslug });
    return bug.fetch().then(function() {
      return bug;
    }, function(err) {
      flash.xhr_error(err);
      bus.trigger('navigate', '/');
    });
  };

  /**
   * Get a bug from the server and display it
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise}
   */
  bugs.open = function(bugslug) {
    return bugs.get(bugslug).then(bugs.display);
  };

  /**
   * Save the currently displayed bug
   *
   * @return {Promise}
   */
  bugs.save = function() {
    var model = bugs.model();
    var bugslug = model.get('slug');

    if (!bugslug) { return bugs.save_as(); }

    bugs.console.log('Saving bug', bugslug);
    return model.save().then(function(res) {
      flash.message_good('@bug_saved', locales.string('bug_saved_msg', res.slug));
      bugs.display(model);
      model._dirty = false;
    }, flash.xhr_error);
  };

  /**
   * Save the currently displayed bug, prompting for title
   *
   * @return {Promise}
   */
  bugs.save_as = function() {
    var model = bugs.model();

    return popups.prompt('bug_name_pick', [
      {
        name: 'title',
        placeholder: 'bug_title',
        value: model.get('title'),
        copy_to: 'slug'
      }, {
        name: 'slug',
        placeholder: 'url_slug',
        value: model.get('slug'),
        filter: _.slugify
      }
    ]).then(function(result) {
      model.set('title', result.title);
      model.set('slug', result.slug);

      return bugs.save();
    });
  };

  /**
   * Create a new bug
   */
  bugs.create = function() {
    bugs.console.log('Creating new bug');
    return new bugs.Bug(bugs._priv.schema);
  };

  // get bug schema from server
  var d = $.Deferred();
  $.get('/api/model/bug').done(function(schema) {
    bugs._priv.schema = schema;
    d.resolve(bugs);
  }).fail(function() {
    bugs._priv.schema = {};
    d.resolve(bugs);
  });

  /**
   * Check if the current bug has unsaved content
   *
   * @return {Boolean} true if unsaved, false otherwise
   */
  bugs.dirty = function() {
    return bugs.model().isDirty();
  };

  /**
   * Check if the current bug is empty
   *
   * @return {Boolean} true if empty, false otherwise
   */
  bugs.empty = function() {
    return bugs.model().isEmpty();
  };

  return d.promise();
});
