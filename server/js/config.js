/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'underscore', 'q',
  'cjson', 'fs'
],
function(
  module, path, _, Q,
  cjson, fs
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var appRoot = __dirname + '/../../';

  // TODO: ensure defaults or bail
  var config = cjson.load(appRoot + 'config.json') || { client: {} };
  config.prod = config.client.prod = (process.env.NODE_ENV === 'production');

  // save the build commit hash to bust cache in production mode
  var commit = null;
  try {
    commit = fs.readFileSync(appRoot + 'build.commit', 'utf8');
    commit = commit.replace(/[^a-z0-9]/ig, '');
  } catch(e) {
    // null
  }
  config.commit = commit;

  return config;
});
