/*
 * debugger.io: An interactive web scripting sandbox
 *
 * com.js: output console
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone  = require('backbone');
  var dom       = require('dom');
  var templates = require('templates');

  // ---

  var com = utils.module('com');

  var comView;

  bus.init(function(av) {
    com.console.log('init com module');

    view();
  });


  var view = function() {
    return (comView instanceof ComView) ? comView :
      comView = new ComView({
        model: new ComModel(),
        collection: new ComMsgCollection()
      });
  };

  /**
   * Model for a single message
   */
  var ComMsgModel = Backbone.Model.extend({
    defaults: {
      type: 'log',
      args: []
    }
  });

  /**
   * View for a single message
   */
  var ComMsgView = Backbone.View.extend({
    template: 'com-msg',
    className: 'com-msg',

    initialize: function() {
      this.render();
    },

    render: function() {
      return templates.get(this.template, this).then(function(template_fn) {
        var data = this.model.toJSON();

        var html = template_fn({ msg: data });
        this.$el.html(html);

        this.$el.addClass('com-msg-' + data.type);

        return this.trigger('render');
      });
    }
  });

  /**
   * Collection of message models
   */
  var ComMsgCollection = Backbone.Collection.extend({
    model: ComMsgModel
  });

  /**
   * Model for the entire com
   */
  var ComModel = Backbone.Model.extend({
    defaults: {
      // com options
    }
  });

  /**
   * View for the entire com
   */
  var ComView = Backbone.View.extend({
    template: 'com',
    _el: '#com',

    events: {
      'dblclick .com-title': 'corner'
    },

    initialize: function() {
      this.position = dom.css(_.str.sprintf('%s._position', this._el));
      this.opacity = dom.css(_.str.sprintf('%s._opacity', this._el)).opacity || 1;

      this.setElement(this._el);

      this.collection.on('add', this.append.bind(this));
      this.$el.draggable({
        containment: 'window',
        handle: '.com-title',
        start: bus.fn_trigger('output:nopointer'),
        stop: bus.fn_trigger('output:pointer')
      });

      this.render();
    },

    append: function(comMsgModel) {
      var comMsgView = new ComMsgView({ model: comMsgModel });
      this.$com_messages.append(comMsgView.$el);
      this.scroll_bottom();
    },

    reset: function() {
      this.collection.reset();
      config.com = null;
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

    scroll_top: function() {
      this.$com_wrappers.scrollTop(0);
    },

    scroll_bottom: function() {
      this.$com_wrappers.scrollTop(this.$com_messages.height());
    },

    render: function() {
      var requery = dom.cache(this, this.$el, {
        by_class: ['com-wrapper', 'com-messages']
      });

      return templates.get(this.template, this).then(function(template_fn) {
        var html = template_fn({ com: this.model.toJSON() });
        this.$el.html(html);
        requery();

        _.each(this.collection, this.append.bind(this));

        return this.trigger('render');
      });
    }
  });

  /**
   * Flush all messages from the com
   */
  com.flush = function() {
    view().reset();
  };

  /**
   * Add a new message to the com
   *
   * @param {Number} time - T+ time (seconds)
   * @param {String} type - console method, one of ('log', 'error', etc.)
   * @param {Array} args
   */
  com.write = function(time, type, args) {
    if (type === 'clear') {
      return com.flush();
    }

    config.com = type;

    var comMsgModel = new ComMsgModel({
      time: time,
      type: type,
      args: args
    });

    view().collection.add(comMsgModel);
  };

  /**
   * Show the com
   */
  com.show = function() {
    view().show();
  };

  /**
   * Hide the com
   */
  com.hide = function() {
    view().hide();
  };

  /**
   * Toggle the com
   */
  com.toggle = function() {
    view().toggle();
  };

  /**
   * Scroll the com to the top
   */
  com.scroll_top = function() {
    view().scroll_top();
  };

  /**
   * Scroll the com to the bottom
   */
  com.scroll_bottom = function() {
    view().scroll_bottom();
  };

  return com;
});
