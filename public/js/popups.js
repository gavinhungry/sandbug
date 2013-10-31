/*
 * debugger.io: An interactive web scripting sandbox
 *
 * popup.js: template-able popup windows
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'templates'
],
function(config, utils, $, _, bus, templates) {
  'use strict';

  var popups = utils.module('popups');

  /**
   * Build HTML for a popup window
   *
   * @param {String} name - name of the popup template
   * @param {Object} [data] - contextual data to the templating function
   * @return {Promise} promise to return the HTML for the popup
   */
  popups.build = function(name, data) {
    var d = $.Deferred();

    var content = _.sprintf('popup-%s', name);
    var template_fns = $.when(templates.get('popup'), templates.get(content));

    template_fns.done(function(popup_fn, content_fn) {
      var contentHtml = content_fn(data);
      var popupHtml = popup_fn({ content: contentHtml });

      d.resolve(popupHtml);
    }).fail(function(err) {
      // uh oh
    });

    return d.promise();
  };

  /**
   * Fade hide and remove all popups on the page
   *
   * @return {Promise} promise to return the number of removed popups
   */
  popups.remove_all = function() {
    var d = $.Deferred();

    var $popups = $('body').children('.popup');
    var len = $popups.length;

    var promises = [];

    _.each($popups, function(popupNode) {
      var $popup = $(popupNode);
      var popup_deferred = $.Deferred();

      $popup.transition({ 'opacity': 0 }, 'fast', function() {
        $popup.remove();
        popup_deferred.resolve(true);
      });

      promises.push(popup_deferred.promise());
    });

    $.when.apply(null, promises).done(function() {
      d.resolve(len);
    });

    return d.promise();
  };

  return popups;
});
