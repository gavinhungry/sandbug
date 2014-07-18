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

    connView = new ConnView({
      model: new ConnModel(),
      collection: new ConnMsgCollection()
    });
  });

  /**
   *
   */
  var ConnMsgModel = Backbone.Model.extend({
    defaults: {
      type: 'log',
      args: []
    }
  });

  /**
   *
   */
  var ConnMsgView = Backbone.View.extend({
    template: 'conn-msg',

    initialize: function() {
      this.render();
    },

    render: function() {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ msg: this.model.toJSON() });
        this.$el.html(html);
      });

      return this;
    }
  });

  /**
   *
   */
  var ConnMsgCollection = Backbone.Collection.extend({
    model: ConnMsgModel
  });

  /**
   *
   */
  var ConnModel = Backbone.Model.extend({
    defaults: {
      wrapping: false
    }
  });

  /**
   *
   */
  var ConnView = Backbone.View.extend({
    template: 'conn',
    el: '#conn',

    initialize: function() {
      this.collection.on('add', this.append.bind(this));
      this.$el.draggable({ containment: 'window' });

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
    if (!(connView instanceof ConnView)) { return; }

    connView.reset();
  };

  /**
   * Add a new message to the conn
   *
   * @param {String} type - console method, one of ('log', 'error', etc.)
   * @param {String} timestamp - ISO formatted timestamp
   * @param {Array} args
   */
  conn.write = function(type, timestamp, args) {
    if (!(connView instanceof ConnView)) { return; }

    var connMsgModel = new ConnMsgModel({
      type: type,
      timestamp: timestamp,
      args: args
    });

    connView.collection.add(connMsgModel);
  };

  return conn;
});
