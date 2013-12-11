/**
 * debugger.io: An interactive web scripting sandbox
 *
 * https://github.com/gavinhungry/debugger.io
 *
 * Copyright (C) 2013 Gavin Lloyd <gavinhungry@gmail.com>
 * This is free software distributed under the terms of the MIT license
 */

(function() {
  'use strict';

  require(['jquery', 'app'], function($, app) {
    $(function() { new app.App(); });
  });

})();
