/*
 * debugger.io: An interactive web scripting sandbox
 *
 * cdn.js: client-side CDN filter
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'dom', 'keys', 'templates'
],
function(config, utils, $, _, Backbone, bus, dom, keys, templates) {
  'use strict';

  var cdn = utils.module('cdn');

  var filterModel, filterView;

  cdn.providers = {
    jsdelivr: {
      name: 'jsDelivr',
      uri: '//cdn.jsdelivr.net/%s/%s/%s'
    },

    cdnjs: {
      name: 'CDNJS',
      uri: '//cdnjs.cloudflare.com/ajax/libs/%s/%s/%s'
    },

    google: {
      name: 'Google',
      uri: '//ajax.googleapis.com/ajax/libs/%s/%s/%s'
    }
  };

  var api_fields = ['name','mainfile','lastversion','description'];

  var jsdelivr_api = '//api.jsdelivr.com/v1/%s/libraries?name=%s*'
    + '&fields=' + api_fields.join(',')
    + '&limit=' + config.cdn_results;

  bus.init(function(av) {
    utils.log('init cdn module');

    filterModel = new cdn.FilterInput();
    filterView = new cdn.FilterInputView({ model: filterModel });

    bus.on('config:cdn', cdn.set_cdn);
    config._priv.set_option('cdn', config.default_cdn);
  });

  /**
   * Set the current CDN by id
   *
   * @param {String} id - CDN id to set
   */
  cdn.set_cdn = function(id) {
    if (!cdn.providers[id]) {
      return cdn.set_cdn(config.default_cdn);
    }

    var cdnName = cdn.providers[id].name;

    dom.set_templated_placeholder(filterView.$filter, cdnName);
    dom.transition_button_label(filterView.$cdn, cdnName);
    bus.trigger('cdn:abort');

    if (id !== config.cdn) { config.cdn = id; }
  };

  /**
   * Current filter value
   */
  cdn.FilterInput = Backbone.Model.extend({
    'defaults': { value: '' }
  });

  /**
   * Input element for filtering CDN packages
   *
   * @param {cdn.FilterInput} - filter model
   */
  cdn.FilterInputView = Backbone.View.extend({
    template: 'cdn-filter',
    el: '#markup .panel-controls',

    initialize: function(options) {
      bus.on('cdn:abort', this.clear, this);
      bus.on('cdn:result:select mirror:focus', this.clear, this);
      this.model.on('change:value', this.update, this);

      this.render();
    },

    events: {
      'input #cdn-filter': 'keypress',
      'keydown #cdn-filter': 'keypress',
      'click #cdn': function(e) {
        e.preventDefault();

        var keys = Object.keys(cdn.providers);
        var i = (keys.indexOf(config.cdn) + 1) % keys.length;
        config.cdn = keys[i];
      }
    },

    keypress: function(e) {
      if (e.which === keys.key_code_for('up')) {
        bus.trigger('cdn:results:prev-active');
        e.preventDefault();
      } else if (e.which === keys.key_code_for('down')) {
        bus.trigger('cdn:results:next-active');
        e.preventDefault();
      } else if (e.which === keys.key_code_for('enter')) {
        bus.trigger('cdn:results:select-active');
        e.preventDefault();
      }

      this.model.set({ value: $(e.target).val() });
    },

    clear: function() {
      this.model.set({ value: '' });
      this.$filter.val('');
    },

    update: function() {
      var filter = _.trim(this.model.get('value')).toLowerCase();

      if (!filter) {
        bus.trigger('cdn:abort');
        return;
      }

      this.display(filter); // debounced
    },

    display: _.debounce(function(filter) {
      var that = this;

      var uri = _.sprintf(jsdelivr_api, config.cdn, filter);
      $.getJSON(uri).done(function(packages) {
        // sort packages by comparing them with the filter string
        var sorted = _.sortBy(packages, function(pkg) {
          return _.levenshtein(filter, pkg.name.toLowerCase());
        });

        // limit the number of displayed results for performance
        var limited = _.first(sorted, config.cdn_results);

        that.resultsView.set_filter(filter);
        that.resultsCollection.reset(limited);
      });
    }, config.cdn_delay),

    render: function() {
      var that = this;

      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ current_cdn: cdn.providers[config.cdn].name });
        this.$el.html(html);
        this.$filter = this.$el.find('#cdn-filter');

        dom.cache(this, this.$el, {
          by_id: 'cdn'
        });

        keys.unregister_handler(this.handler);

        // focus the input on key command
        this.handler = keys.register_handler({
          ctrl: true, key: '/'
        }, function(e) {
          that.$filter.select();
        });

        var cdnNameInit = cdn.providers[config.cdn].name;
        dom.set_templated_placeholder(this.$filter, cdnNameInit);

        this.$filter.prop('disabled', false);

        this.resultsCollection = new cdn.FilterResults([]);
        this.resultsView = new cdn.FilterResultsView({
          collection: this.resultsCollection
        });
      });
    }
  });

  /**
   * An available CDN package
   */
  cdn.FilterResult = Backbone.Model.extend({
    defaults: {
      name: '',
      mainfile: '',
      lastversion: '',
      active: false
    }
  });

  /**
   * List element representing an available CDN package
   *
   * @param {cdn.FilterResult} - model of an available package
   */
  cdn.FilterResultView = Backbone.View.extend({
    template: 'cdn-result',
    tagName: 'li',

    initialize: function(options) {
      this.render();
    },

    events: {
      'click': 'select_lib'
    },

    get_uri: function() {
      var pkg = this.model.toJSON();
      var provider = cdn.providers[config.cdn];

      return _.sprintf(provider.uri, pkg.name, pkg.lastversion, pkg.mainfile);
    },

    select_lib: function() {
      this.$el.removeClass('active');
      bus.trigger('cdn:result:select', this.get_uri());
    },

    render: function() {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ pkg: this.model.toJSON() });
        this.$el.html(html);
      });
    }
  });

  /**
   * Collection of cdn.FilterResult(s)
   */
  cdn.FilterResults = Backbone.Collection.extend({
    model: cdn.FilterResult
  });

  /**
   * List of CDN packages to add to project
   * filtered and sorted by cdn.FilterInput
   *
   * @param {cdn.FilterResults} - collection of available packages
   * @param {jQuery} $el - element to template into
   * @param {String} filter - filter used
   */
  cdn.FilterResultsView = Backbone.View.extend({
    el: '#cdn-results',

    initialize: function(options) {
      this.collection.on('reset', this.render, this);

      var max_height = dom.css(this.$el.selector)['max-height'];
      this.max_height = parseInt(max_height, 10) || 0;

      bus.off_ns('cdn:results');
      bus.on('cdn:results:prev-active', this.prev_active, this);
      bus.on('cdn:results:next-active', this.next_active, this);
      bus.on('cdn:results:select-active', this.select_active, this);

      bus.on('cdn:result:select mirror:focus cdn:abort', this.hide, this);

      this.$content = this.$el.children('.content');
      this.filter = '';
      this.render();
    },

    set_filter: function(filter) {
      this.filter = filter;
    },

    show: function() {
      var num_results = this.$el.find('li:not(:empty)').length;
      while (num_results !== this.collection.models.length) {
        return _.defer(this.show.bind(this));
      }

      this.$el.css({ 'display': 'block' });

      // adjust margins when overflowing
      var overflow = dom.is_overflowing_with_scrollbar(this.$ol);
      this.$ol.toggleClass('overflow', overflow);

      var maxHeight = this.$nomatch.is(':visible') ?
        this.$nomatch.outerHeight(true) :
        Math.min(this.$ol.outerHeight() + 4, this.max_height);

      this.$el.css({ 'max-height': _.sprintf('%spx', maxHeight) });

      this.first_active();
      dom.transition_with_scrollbar(this.$el, { 'opacity': 1 });
    },

    hide: function(callback, stop_fn) {
      var that = this;

      this.$el.transition({ 'opacity': 0 }, 'fast', function() {
        if (_.isFunction(stop_fn) && stop_fn() === true) { return; }

        this.css({ 'display': 'none' });
        _.isFunction(callback) && callback.call(that);
      });
    },

    // set the first result as the active result
    first_active: function() {
      var $children = this.$ol.children();
      $children.filter('.active').removeClass('.active');
      $children.first().addClass('active');

      this.scroll_active();
    },

    // set the previous result as the active result
    prev_active: function() {
      var $children = this.$ol.children();
      var $active = $children.filter('.active');
      var $prev = $active.first().prev();

      if ($prev.length) {
        $active.removeClass('active');
        $prev.addClass('active');
      }

      this.scroll_active();
    },

    // set the next result as the active result
    next_active: function() {
      var $children = this.$ol.children();
      var $active = $children.filter('.active');
      var $next = $active.first().next();

      if ($next.length) {
        $active.removeClass('active');
        $next.addClass('active');
      } else if (!$active.length) {
        $children.first().addClass('active');
      }

      this.scroll_active();
    },

    // keep the active result visible
    scroll_active: function() {
      var $active = this.$ol.children().filter('.active').first();
      if ($active.length && this.$ol.hasClass('overflow')) {
        var paddingTop = parseInt(this.$ol.css('padding-top'), 10);
        var paddingBottom = parseInt(this.$ol.css('padding-bottom'), 10);

        var contentHeight = this.$content.outerHeight();
        var contentTop = this.$content.scrollTop();
        var contentBottom = contentTop + contentHeight;

        var activeHeight = $active.outerHeight();
        var activeTop = contentTop + $active.position().top;
        var activeBottom = activeTop + activeHeight;

        var scrollTop;

        // too far down
        if (activeBottom > contentBottom) {
          scrollTop = activeBottom - contentHeight + paddingBottom;
          dom.scrollbar_scroll_top(this.$ol, scrollTop);
        }
        // too far up
        else if (activeTop < contentTop) {
          scrollTop = activeTop - paddingTop;
          dom.scrollbar_scroll_top(this.$ol, scrollTop);
        }
      }
    },

    // insert the active result
    select_active: function() {
      this.hide();

      var activeResultView = _.find(this._rvs, function(rv) {
        return rv.$el.hasClass('active');
      });

      if (activeResultView instanceof cdn.FilterResultView) {
        activeResultView.select_lib();
      }
    },

    render: function() {
      var that = this;

      // close the results list if there is no filter
      if (!this.filter) {
        this.hide(function() { that.$content.empty(); },
        // abort if a filter exists by the time the transition completes
        function() { return !!that.filter; });

        return;
      }

      // show "no results" as appropriate
      this.$nomatch = this.$el.children('.nomatch');
      this.$nomatch.toggleClass('hide', !!this.collection.models.length);

      this._rvs = [];
      this.$ol = $('<ol>');

      // populate filtered/sorted packages
      _.each(this.collection.models, function(result) {
        var rv = new cdn.FilterResultView({ model: result });
        this._rvs.push(rv);
        this.$ol.append(rv.el);
      }, this);

      this.$content.html(this.$ol);
      this.show();
    }
  });

  return cdn;
});
