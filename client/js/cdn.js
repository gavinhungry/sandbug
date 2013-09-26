/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * cdn.js: client-side CDN cache and filter
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'mirrors', 'templates'
],
function(config, utils, $, _, Backbone, bus, mirrors, templates) {
  'use strict';

  var cdn = utils.module('cdn');

  var cdnjs = '%s://cdnjs.cloudflare.com/ajax/libs/%s/%s/%s';
  var cache = null;

  /**
   * Check if client-side CDN package cache exists
   *
   * @return {Boolean} true if cache exists, false otherwise
   */
  cdn.cache_exists = function() {
    return _.isArray(cache) && cache.length > 0;
  };

  /**
   * Return a cached version of CDN packages
   *
   * @param {Boolean} update - if true, force the cache to update first
   * @return {Promise} promise to return the CDN packages {Array}
   */
  cdn.get_cache = function(update) {
    var d = $.Deferred();

    if (!update && cdn.cache_exists()) {
      d.resolve(cache);
    } else {
      cdn.update_cache().done(function(packages) {
        d.resolve(utils.ensure_array(packages));
      }).fail(function(err) {
        d.resolve(utils.ensure_array(cache));
      });
    }

    return d.promise();
  };

  /**
   * Update the CDN package cache now
   *
   * @return {Promise}
   */
  cdn.update_cache = function() {
    var d = $.Deferred();

    $.get(utils.uri('cdn')).done(function(packages) {
      cache = packages;
      d.resolve(packages);
    }).fail(function(err) {
      d.reject(err);
    });

    return d.promise();
  };

  /**
   * Add a library element string at the best position that can be found
   *
   * @param {String} uri - URI of the library to be added
   */
  cdn.add_lib_to_markup = function(uri) {
    var markup = mirrors.get_by_id('markup');
    if (!markup || !uri) { return; }

    var indent = markup.cm.getOption('indentUnit'); // default 2
    var tag = utils.resource_tag(uri);
    var lib = utils.resource_element_string(uri); // <script ...> or <link ...>
    var indentLib = _.sprintf('%s%s', indent, lib);

    var scriptPos, linkPos, headPos, htmlPos;

    // put the new script element after the last script element in the document
    if (scriptPos = mirrors.search_last(markup, /<script [^>]*><\/script>/i)) {
      if (tag === 'script') {
        lib = _.sprintf('\n%s%s', _.repeat(' ', scriptPos.from.ch), lib);
        return mirrors.add_content_at(markup, lib, scriptPos.to);
      }
    }

    // put the new link element after the last link element in the document
    if (linkPos = mirrors.search_last(markup, /<link [^>]*>/i)) {
      if (tag === 'link') {
        lib = _.sprintf('\n%s%s', _.repeat(' ', linkPos.from.ch), lib);
        return mirrors.add_content_at(markup, lib, linkPos.to);
      }
    }

    // put the new element as the last item in <head>
    if (headPos = mirrors.search_first(markup, '</head>', true)) {
      lib = _.sprintf('%s%s\n', _.repeat(' ', indent), lib);
      return mirrors.add_content_at(markup, lib, headPos.from);
    }

    // put the new element as the first item in <head>
    if (headPos = mirrors.search_first(markup, '<head>', true)) {
      lib = _.sprintf('\n%s%s', _.repeat(' ', headPos.from.ch + indent), lib);
      return mirrors.add_content_at(markup, lib, headPos.to);
    }

    // put the new element as the first item in <html>
    if (htmlPos = mirrors.search_first(markup, '<html>', true)) {
      lib = _.sprintf('\n%s%s', _.repeat(' ', htmlPos.from.ch + indent), lib);
      return mirrors.add_content_at(markup, lib, htmlPos.to);
    }

    // last resort: just prepend the entire document
    mirrors.add_content_start(markup, lib);
  };

  /**
   * Init the CDN filter input
   */
  cdn.init_filter = function() {
    var filterModel = new cdn.FilterInput();
    var filterView = new cdn.FilterInputView({ model: filterModel });
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
    el: '#markup > .panel-options',

    initialize: function(options) {
      bus.on('cdn:select', this.clear, this);
      this.model.on('change:value', this.update, this);

      this.render();
    },

    events: {
      'keyup #cdn': _.debounce(function(e) {
        this.model.set({ value: $(e.target).val() });
      }, 10)
    },

    clear: function() {
      this.model.set({ value: '' });
      this.$cdn.val('');
    },

    update: function() {
      var that = this;
      var filter = _.trim(this.model.get('value'));

      cdn.get_cache().done(function(packages) {
        // filter for the packages that match the input
        var filtered = _.filter(packages, function(pkg) {
          return !!pkg.name && !!pkg.filename && !!pkg.version &&
            _.str.include(pkg.name.toLowerCase(), filter);
        });

        // sort filtered packages by comparing them with the filter string
        var sorted = _.sortBy(filtered, function(pkg) {
          return _.levenshtein(filter, pkg.name.toLowerCase());
        });

        // create a new cdn.FilterResultsView with the updated results
        var results = new cdn.FilterResults(sorted);
        var resultsView = new cdn.FilterResultsView({
          filter: filter,
          collection: results,
          $el: that.$el.children('#cdn-results')
        });
      });
    },

    render: function() {
      var that = this;

      templates.get(this.template, function(template) {
        var html = template;
        this.$el.html(html);
        this.$cdn = this.$el.find('#cdn');

        // focus the input on key command
        keys.register_handler({ ctrl: true, key: '/' }, function(e) {
          that.$cdn.select();
        });

        this.update();
      }, this);
    }
  });

  /**
   * An available CDN package
   */
  cdn.FilterResult = Backbone.Model.extend({
    defaults: { name: '', filename: '', version: '' }
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

    get_uri: function(secure) {
      var pkg = this.model.toJSON();
      var protocol = !!secure ? 'https' : 'http';
      return _.sprintf(cdnjs, protocol, pkg.name, pkg.version, pkg.filename);
    },

    select_lib: function() {
      bus.trigger('cdn:select');
      cdn.add_lib_to_markup(this.get_uri());
      mirrors.refocus();
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = _.template(template, { pkg: this.model.toJSON() });
        this.$el.html(html);
      }, this);
    }
  });

  /**
   * Collection of cdn.FilterResult(s)
   */
  cdn.FilterResults = Backbone.Collection.extend({
    model: cdn.FilterResult,
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
    template: 'cdn-results',

    initialize: function(options) {
      _.extend(this, _.pick(this.options, '$el', 'filter'));
      bus.on('cdn:select', this.hide, this);

      this.render();
    },

    show: function() {
      this.$el.css({ 'display': 'block' });

      // adjust margins when overflowing
      var overflow = this.$ol[0].scrollHeight > this.$ol[0].offsetHeight;
      this.$ol.toggleClass('overflow', overflow);

      this.$el.transition({ 'opacity': 1 }, 'fast');
    },

    hide: function(callback) {
      var that = this;

      this.$el.transition({ 'opacity': 0 }, 'fast', function() {
        this.css({ 'display': 'none' });
        if (_.isFunction(callback)) { callback.call(that); }
      });
    },

    render: function() {
      // close the results list if there is no filter
      if (!this.filter) {
        this.hide(function() { this.$el.empty(); });
        return;
      }

      templates.get(this.template, function(template) {
        var html = template;
        this.$el.html(html);

        // show "no results" as appropriate
        var $nomatch = this.$el.children('.nomatch');
        $nomatch.toggleClass('hide', !!this.collection.models.length);

        // populate filtered/sorted packages
        this.$ol = this.$el.children('ol').empty();
        _.each(this.collection.models, function(result) {
          var rv = new cdn.FilterResultView({ model: result });
          this.$ol.append(rv.el);
        }, this);

        this.show();
      }, this);
    }
  });

  return cdn;
});
