/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * cdn.js: client-side CDN cache and filter
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config', 'utils'
],
function($, _, Backbone, templates, dom, config, utils) {
  'use strict';

  var cdn = utils.module('cdn');
  var cache = null;

  /**
   * Check if client-side CDN package cache exists
   *
   * @return {Boolean}: true if cache exists, false otherwise
   */
  cdn.cache_exists = function() {
    return _.isArray(cache) && cache.length > 0;
  };

  /**
   * Return a cached version of CDN packages
   *
   * @param {Boolean} update: if true, force the cache to update first
   * @return {Promise}: promise to return the CDN packages {Array}
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

  // FilterResult: Model
  cdn.FilterResult = Backbone.Model.extend({
    // defaults
  });

  // FilterResultView: li
  cdn.FilterResultView = Backbone.View.extend({
    template: 'cdn-result',
    tagName: 'li',

    initialize: function() {
      this.render();
    },

    events: {
      'click': 'add_lib'
    },

    add_lib: function(e) {
      // add lib to markup panel
      utils.log('add lib to markup panel');
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = _.template(template, { pkg: this.model.toJSON() });
        this.$el.html(html);
      }, this);
      return this;
    }
  });

  // FilterResults: Collection of FilterResult
  cdn.FilterResults = Backbone.Collection.extend({
    model: cdn.FilterResult,

    initialize: function(models, options) {

    }
  });

  // FilterResultsView: <div><ol>
  cdn.FilterResultsView = Backbone.View.extend({
    template: 'cdn-results',
    el: '#cdn-results',

    initialize: function() {
      this.render();
    },

    show: function() {
      this.$el.css({ 'display': 'block' });

      // adjust margins when overflowing
      var overflow = this.$ol[0].scrollHeight > this.$ol[0].offsetHeight;
      this.$ol.toggleClass('overflow', overflow);

      this.$el.css({ 'opacity': 1 });
    },

    hide: function() {
      this.$el.transition({ 'opacity': 0 }, 'fast', function() {
        this.css({ 'display': 'none' });
      });
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = template;
        this.$el.html(html);

        this.$ol = this.$el.children('ol');
        dom.cache(this, this.$el, {
          'by_class': ['results']
        });

        _.each(this.collection.models, function(result) {
          var rv = new cdn.FilterResultView({ model: result });
          this.$results.append(rv.el);
        }, this);

        this.show();
      }, this);

      return this;
    }
  });

  /**
   *
   * @param {jQuery} $cdn:
   */
  cdn.init_filter = function($cdn) {
    cdn.get_cache().done(function(packages) {
      var resultsCol = new cdn.FilterResults(packages);
      var resultsView = new cdn.FilterResultsView({ collection: resultsCol });
    });
  };

  /*
    $cdn.on('keyup', _.debounce(function(e) {
      var filter = _.trim($cdn.val().toLowerCase());

      cdn.get_cache().done(function(packages) {

        // filter for the packages that match the input
        var filtered = _.filter(packages, function(pkg) {
          return _.str.include(pkg.name.toLowerCase(), filter);
        });

        // sort filtered packages by comparing them with the filter string
        var sorted = _.sortBy(filtered, function(pkg) {
          return _.levenshtein(filter, pkg.name.toLowerCase());
        });
  */

  return cdn;
});
