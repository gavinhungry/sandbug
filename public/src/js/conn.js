/*
 * debugger.io: An interactive web scripting sandbox
 *
 * conn.js: output console
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone = require('backbone');
  var templates = require('templates');

  // ---

  var conn = utils.module('conn');

  var connView;

  bus.init(function(av) {
    conn.console.log('init conn module');

    view();
  });


  var view = function() {
    return (connView instanceof ConnView) ? connView :
      connView = new ConnView({
        model: new ConnModel(),
        collection: new ConnMsgCollection()
      });
  };

  /**
   * Model for a single message
   */
  var ConnMsgModel = Backbone.Model.extend({
    defaults: {
      type: 'log',
      args: []
    }
  });

  /**
   * View for a single message
   */
  var ConnMsgView = Backbone.View.extend({
    template: 'conn-msg',
    className: 'conn-msg',

    initialize: function() {
      this.render();
    },

    render: function() {
      templates.get(this.template, this).done(function(template_fn) {
        var data = this.model.toJSON();

        var html = template_fn({ msg: data });
        this.$el.html(html);

        this.$el.addClass('conn-msg-' + data.type);
      });

      return this;
    }
  });

  /**
   * Collection of message models
   */
  var ConnMsgCollection = Backbone.Collection.extend({
    model: ConnMsgModel
  });

  /**
   * Model for the entire conn
   */
  var ConnModel = Backbone.Model.extend({
    defaults: {
      // conn options
    }
  });

  /**
   * View for the entire conn
   */
  var ConnView = Backbone.View.extend({
    template: 'conn',
    _el: '#conn',

    events: {
      'dblclick .conn-title': 'corner'
    },

    initialize: function() {
      this.position = dom.css(_.sprintf('%s._position', this._el));
      this.opacity = dom.css(_.sprintf('%s._opacity', this._el)).opacity || 1;

      this.setElement(this._el);

      this.collection.on('add', this.append.bind(this));
      this.$el.draggable({
        containment: 'window',
        handle: '.conn-title'
      });

      this.render();
    },

    append: function(connMsgModel) {
      var $messages = this.$el.children('.conn-messages');

      var connMsgView = new ConnMsgView({ model: connMsgModel });
      $messages.append(connMsgView.$el);
    },

    reset: function() {
      this.collection.reset();
      this.render();
    },

    corner: function() {
      this.$el.transition({
        top: this.position.top,
        left: this.position.left
      }, 'fast');
    },

    show: function() {
      var top = parseInt(this.$el.css('top'), 10);

      if (_.isNaN(top)) {
        top = parseInt(this.position.top, 10) - 16;
        this.$el.css({
          top: top,
          left: this.position.left
        });
      }

      this.$el.show().transition({
        opacity: this.opacity,
        top: top + 16
      }, 'fast');
    },

    hide: function() {
      var top = parseInt(this.$el.css('top'), 10);

      this.$el.transition({
        opacity: 0,
        top: top - 16
      }, 'fast', function() {
        this.hide();
      });
    },

    toggle: function() {
      this.$el.is(':visible') ? this.hide() : this.show();
    },

    render: function() {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ conn: this.model.toJSON() });
        this.$el.html(html);

        _.each(this.collection, this.append.bind(this));
      });

      return this;
    }
  });

  /**
   * Flush all messages from the conn
   */
  conn.flush = function() {
    view().reset();
  };

  /**
   * Add a new message to the conn
   *
   * @param {Number} time - T+ time (seconds)
   * @param {String} type - console method, one of ('log', 'error', etc.)
   * @param {Array} args
   */
  conn.write = function(time, type, args) {
    var connMsgModel = new ConnMsgModel({
      time: time,
      type: type,
      args: args
    });

    view().collection.add(connMsgModel);
  };

  /**
   * Show the conn
   */
  conn.show = function() {
    view().show();
  };

  /**
   * Hide the conn
   */
  conn.hide = function() {
    view().hide();
  };

  /**
   * Toggle the conn
   */
  conn.toggle = function() {
    view().toggle();
  };

  return conn;
});
