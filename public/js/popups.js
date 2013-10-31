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
  popups.build_popup = function(name, data) {
    var d = $.Deferred();

    var content = _.sprintf('popup-%s', name);
    var template_fns = $.when(templates.get('popup'), templates.get(content));

    template_fns.done(function(popup_fn, content_fn) {
      var contentHtml = content_fn(data);
      var popupHtml = popup_fn({ content: contentHtml });

      d.resolve(popupHtml);
    }).fail(function(a, b, c) {
      // uh oh
    });

    return d.promise();
  };

  return popups;
});
