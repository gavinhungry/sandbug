define(['utils', 'config', 'jquery', 'underscore'],
function(utils, config, $, _) {
  'use strict';

  /**
   * utils.module
   */
  describe('utils.module', function() {
    it('should initially return an empty object', function() {
      var module = utils.module('foo', null, false);
      expect(module._priv).toBeDefined();
      expect(_.size(module)).toEqual(1); // just _priv
    });

    it('should allow extending a base object', function() {
      var module = utils.module('foo', { 'bar': 123 }, false);
      expect(module.bar).toEqual(123);
    });

    it('should allow attaching to the global window', function() {
      var module = utils.module('foo_test', null, false);
      expect(window.foo_test).toBeUndefined();

      module = utils.module('foo_test', null, true);
      expect(window.foo_test).toBeDefined();
      expect(module).toEqual(window.foo_test);
      delete window.foo_test;
    });
  });

  /**
   * utils.console.log
   */
  describe('utils.console.log', function() {
    var prod = config.prod;

    beforeEach(function() { spyOn(console, 'log'); });
    afterEach(function() { config.prod = prod; });

    it('should call console.log when config.prod is false', function() {
      config.prod = false;
      utils.console.log('a', 'b');
      expect(console.log).toHaveBeenCalledWith('a', 'b');
    });

    it('should not call console.log when config.prod is true', function() {
      config.prod = true;
      utils.console.log('a', 'b');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  /**
   * utils.ensure_jquery
   */
  describe('utils.ensure_jquery', function() {
    it('should always return a jQuery object', function() {
      expect(utils.ensure_jquery()).toBeAjQueryObject();
      expect(utils.ensure_jquery([])).toBeAjQueryObject();
      expect(utils.ensure_jquery($('<div>')[0])).toBeAjQueryObject();
    });

    it('should wrap HTMLElement(s)', function() {
      var div_1 = $('<div>')[0];
      var div_2 = $('<div>')[0];
      var div_3 = $('<div>')[0];

      expect(utils.ensure_jquery(div_1).length).toEqual(1);
      expect(utils.ensure_jquery([div_1]).length).toEqual(1);
      expect(utils.ensure_jquery([div_1, div_2]).length).toEqual(2);
      expect(utils.ensure_jquery([div_1, div_2, div_3]).length).toEqual(3);
    });

    it('should return an empty set for non HTMLElement/Arrays', function() {
      expect(utils.ensure_jquery().length).toEqual(0);
      expect(utils.ensure_jquery(123).length).toEqual(0);
      expect(utils.ensure_jquery('div').length).toEqual(0);
    });
  });

  /**
   * utils.ensure_array
   */
  describe('utils.ensure_array', function() {
    it('should always return an array', function() {
      expect(utils.ensure_array()).toEqual([]);
      expect(utils.ensure_array(null)).toEqual([]);
      expect(utils.ensure_array([])).toEqual([]);
      expect(utils.ensure_array([1,2,3])).toEqual([1,2,3]);
      expect(utils.ensure_array(123)).toEqual([123]);
      expect(utils.ensure_array({})).toBeAnArray();
      expect(utils.ensure_array({ 'foo': [] })).toBeAnArray();
      expect(utils.ensure_array(function(){})).toBeAnArray();
    });
  });

  /**
   * utils.ensure_string
   */
  describe('utils.ensure_string', function() {
    it('should always return a string', function() {
      expect(utils.ensure_string()).toEqual('');
      expect(utils.ensure_string(null)).toEqual('');
      expect(utils.ensure_string(-1)).toEqual('-1');
      expect(utils.ensure_string('foo')).toEqual('foo');
      expect(utils.ensure_string([1,2,3])).toEqual('');
      expect(utils.ensure_string({ foo: 'bar' })).toEqual('');
      expect(utils.ensure_string(function foo() {})).toEqual('');
    });
  });

  /**
   * utils.reduce
   */
  describe('utils.reduce', function() {
    var scope = {
      foo: { bar: { baz: 'robot' } }
    };

    beforeEach(function() {
      window._test_utils_reduce = {
        does: { exist: 'foo' }
      };
    });

    afterEach(function() {
      delete window._test_utils_reduce;
    });

    it('should return null if object does not exist', function() {
      expect(utils.reduce('this.does.not.exist')).toEqual(null);
    });

    it('should return object on global window by default', function() {
      expect(utils.reduce('_test_utils_reduce.does.exist')).toEqual('foo');
    });

    it('should return object on scope if passed', function() {
      expect(utils.reduce('_test_utils_reduce.does.exist', scope)).toEqual(null);
      expect(utils.reduce('foo.bar.baz', scope)).toEqual('robot');
    });
  });

  /**
   * utils.no_quotes
   */
  describe('utils.no_quotes', function() {
    it('should always return a string', function() {
      expect(utils.no_quotes()).toEqual('');
      expect(utils.no_quotes('')).toEqual('');
      expect(utils.no_quotes(null)).toEqual('');
    });

    it('should remove all double quotes', function() {
      expect(utils.no_quotes('"""')).toEqual('');
      expect(utils.no_quotes('foo"bar')).toEqual('foobar');
      expect(utils.no_quotes('foo\"bar')).toEqual('foobar');
      expect(utils.no_quotes('"foo" says "bar"')).toEqual('foo says bar');
    });
  });

  /**
   *  utils.uri
   */
  describe('utils.uri', function() {
    it('should return an absolute URI', function() {
      expect(utils.uri('foobar')).toEqual(config.root + 'foobar');
      expect(utils.uri()).toEqual(config.root);
    });

    it('should return the URI when URI is already absolute', function() {
      expect(utils.uri(config.root + 'foobar')).toEqual(config.root + 'foobar');
    });
  });

  /**
   * utils.extension
   */
  describe('utils.extension', function() {
    it('should return the correct extension', function() {
      expect(utils.extension()).toEqual('');
      expect(utils.extension('')).toEqual('');
      expect(utils.extension('foo.js')).toEqual('js');
      expect(utils.extension('" foo.bar.css "')).toEqual('css');
    });
  });

  /**
   * utils.script_element_string
   */
  describe('utils.script_element_string', function() {
    it('should return a <script> element string for a URI', function() {
      var script = utils.script_element_string('foo.js');
      expect(script).toEqual('<script type="application/javascript" src="foo.js"></script>');
    });

    it('should allow for a custom mime-type', function() {
      var script = utils.script_element_string('bar.js', 'foo/bar');
      expect(script).toEqual('<script type="foo/bar" src="bar.js"></script>');
    });
  });

  /**
   * utils.style_element_string
   */
  describe('utils.style_element_string', function() {
    it('should return a <style> element string for a URI', function() {
      var style = utils.style_element_string('foo.css');
      expect(style).toEqual('<link rel="stylesheet" type="text/css" href="foo.css">');
    });

    it('should allow for a custom mime-type', function() {
      var style = utils.style_element_string('bar.css', 'foo/bar');
      expect(style).toEqual('<link rel="stylesheet" type="foo/bar" href="bar.css">');
    });
  });

  /**
   * utils.resource_tag
   */
  describe('utils.resource_tag', function() {
    it('should return "script" for JavaScript files', function() {
      expect(utils.resource_tag('foo.js')).toEqual('script');
    });

    it('should return "link" for CSS files', function() {
      expect(utils.resource_tag('bar.css')).toEqual('link');
    });

    it('should return null for unknown file types', function() {
      expect(utils.resource_tag()).toEqual(null);
      expect(utils.resource_tag('')).toEqual(null);
      expect(utils.resource_tag('foo.bar')).toEqual(null);
      expect(utils.resource_tag('bar.tld')).toEqual(null);
    });
  });

  /**
   * utils.resource_element_string
   */
  describe('utils.resource_element_string', function() {
    it('should return script element for .js extension', function() {
      expect(utils.resource_element_string('foo.js'))
        .toEqual(utils.script_element_string('foo.js'));
    });

    it('should return style element for .css extension', function() {
      expect(utils.resource_element_string('foo.css'))
        .toEqual(utils.style_element_string('foo.css'));
    });
  });

  /**
   * utils.path
   */
  describe('utils.path', function() {
    it('should return a path without a protocol', function() {
      expect(utils.path('gopher://example.tld')).not.toContain('gopher://');
    });

    it('should return a path without an extensioned filename', function() {
      expect(utils.path('http://example.tld/file.html')).not.toContain('file.html');
    });

    it('should return a domain name and directory path', function() {
      expect(utils.path('http://example.tld/dir/dir/file.html')).toEqual('example.tld/dir/dir');
      expect(utils.path('http://example.tld/dir/dir/')).toEqual('example.tld/dir/dir');
      expect(utils.path('http://example.tld/dir/dir')).toEqual('example.tld/dir/dir');
    });
  });

  /**
   * utils.resolve
   */
  describe('utils.resolve', function() {
    it('should return a promise to resolve to a value', function(done) {
      utils.resolve('foobar').done(function(val) {
        expect(val).toEqual('foobar');
      }).fail(function() {
        expect('promise to resolve to an expected value').toEqual(true);
      }).always(done);
    });
  });

  /**
   * utils.reject
   */
  describe('utils.reject', function() {
    it('should return a promise to reject to a value', function(done) {
      utils.reject('foobar').done(function() {
        expect('promise to reject to an expected value').toEqual(true);
      }).fail(function(val) {
        expect(val).toEqual('foobar');
      }).always(done);
    });
  });

  /**
   * utils.resolve_boolean
   */
  describe('utils.resolve_boolean', function() {
    it('should resolve an immediate value to true', function(done) {
      utils.resolve_boolean(5).always(function(val) {
        expect(this.state()).toEqual('resolved');
        expect(val).toEqual(true);
        done();
      });
    });

    it('should resolve an resolved promise to true', function(done) {
      var p = utils.resolve(null);

      utils.resolve_boolean(p).always(function(val) {
        expect(this.state()).toEqual('resolved');
        expect(val).toEqual(true);
        done();
      });
    });

    it('should resolve an rejected promise to false', function(done) {
      var p = utils.reject(null);

      utils.resolve_boolean(p).always(function(val) {
        expect(this.state()).toEqual('resolved');
        expect(val).toEqual(false);
        done();
      });
    });
  });

  /**
   * utils.clamp
   */
  describe('utils.clamp', function() {
    it('should return value, if no min or max provided', function() {
      expect(utils.clamp(-3)).toEqual(-3);
      expect(utils.clamp(0)).toEqual(0);
      expect(utils.clamp(5)).toEqual(5);
    });

    it('should clamp value over min, if max is not provided', function() {
      expect(utils.clamp(0, 0)).toEqual(0);
      expect(utils.clamp(100, 200)).toEqual(200);
      expect(utils.clamp(100, 50)).toEqual(100);
      expect(utils.clamp(-100, -200)).toEqual(-100);
      expect(utils.clamp(-100, -50)).toEqual(-50);
    });

    it('should clamp value under max, if min is not provided', function() {
      expect(utils.clamp(0, null, 0)).toEqual(0);
      expect(utils.clamp(100, null, 200)).toEqual(100);
      expect(utils.clamp(100, null, 50)).toEqual(50);
      expect(utils.clamp(-100, null, -200)).toEqual(-200);
      expect(utils.clamp(-100, null, -50)).toEqual(-100);
    });

    it('should clamp value between min and max, if both provided', function() {
      expect(utils.clamp(0, 0, 0)).toEqual(0);
      expect(utils.clamp(100, -20, 200)).toEqual(100);
      expect(utils.clamp(60, 40, 50)).toEqual(50);
      expect(utils.clamp(20, 60, 90)).toEqual(60);
    });
  });

  /**
   * utils.clone
   */
  describe('utils.clone', function() {
    var obj = { foo: 'bar', bar: 'baz' };

    it('should not modify original object', function() {
      var before = JSON.stringify(obj);
      var clone = utils.clone(obj);
      clone.foo = false;
      var after = JSON.stringify(obj);

      expect(before).toEqual(after);
    });

    it('should contain all keys/values of original object', function() {
      var clone = utils.clone(obj);
      expect(JSON.stringify(obj)).toEqual(JSON.stringify(clone));
    });
  });

  /**
   * utils.parse_json
   */
  describe('utils.parse_json', function() {
    it('should parse JSON', function() {
      expect(utils.parse_json('{ "foo": "bar" }')).toHaveProperty('foo');
    });

    it('should return null if JSON cannot be parsed', function() {
      expect(utils.parse_json('{ // this is not JSON ! }')).toEqual(null);
    });
  });

  /**
   * utils.memoize_hasher
   */
  describe('utils.memoize_hasher', function() {
    it('should join arguments uniquely', function() {
      expect(utils.memoize_hasher()).toEqual('');
      expect(utils.memoize_hasher('foo')).toEqual('foo');
      expect(utils.memoize_hasher('foo', 'bar')).toEqual('foo<<<!>>>bar');
      expect(utils.memoize_hasher('foo', 'bar', 'baz')).toEqual('foo<<<!>>>bar<<<!>>>baz');
    });
  });

  /**
   * utils.sanitize_resource_id
   */
  describe('utils.sanitize_resource_id', function() {
    it('should remove unsanitary characters', function() {
      expect(utils.sanitize_resource_id('foo#bar')).toEqual('foobar');
      expect(utils.sanitize_resource_id('foo/bar')).toEqual('foobar');
      expect(utils.sanitize_resource_id('#--foo/bar--#')).toEqual('--foobar--');
      expect(utils.sanitize_resource_id('foo!@#$%^&*()bar#baz')).toEqual('foobarbaz');
      expect(utils.sanitize_resource_id('foo-bar')).toEqual('foo-bar');
      expect(utils.sanitize_resource_id('foo_bar')).toEqual('foo_bar');
    });
  });

  /**
   * utils.minify_css_selector
   */
  describe('utils.minify_css_selector', function() {
    it('should minify CSS selectors without changing the selector', function() {
      expect(utils.minify_css_selector('div > span')).toEqual('div>span');
      expect(utils.minify_css_selector('div + span')).toEqual('div+span');
      expect(utils.minify_css_selector('div  span')).toEqual('div span');
    });
  });

  /**
   * utils.form_map
   */
  describe('utils.form_map', function() {
    var $form;

    beforeEach(function() {
      $form = $('<form><input name="first" value="Gavin"><div><<input name="last" value="Lloyd"></form');
    });

    it('should return a map of form inputs', function() {
      var $form = $('<form><input name="first" value="Gavin"><div><input name="last" value="Lloyd"></form');
      var map = utils.form_map($form);

      expect(map).toBeDefined();
      expect(map).toHaveProperty('first');
      expect(map.first).toEqual('Gavin');
      expect(map).toHaveProperty('last');
      expect(map.last).toEqual('Lloyd');
    });

    it('should use the last seen value if name is reused', function() {
      var $form = $('<form><input name="first" value="Gavin"><input name="first" value="Lloyd"></form');
      var map = utils.form_map($form);

      expect(map).toBeDefined();
      expect(map).toHaveProperty('first');
      expect(map.first).toEqual('Lloyd');
    });
  });

  /**
   * utils.value
   */
  describe('utils.value', function() {
    it('should read a value passed directly', function(done) {
      utils.value('foo_A').done(function(val) {
        expect(val).toEqual('foo_A');
      }).always(done);
    });

    it('should read a value passed from a function', function(done) {
      utils.value(function() { return 'foo_B'; }).done(function(val) {
        expect(val).toEqual('foo_B');
      }).always(done);
    });

    it('should read a value passed from a promise', function(done) {
      utils.value(utils.resolve('foo_C')).done(function(val) {
        expect(val).toEqual('foo_C');
      }).always(done);
    });

    it('should read a value passed from a promise-returning function', function(done) {
      utils.value(function() { return utils.resolve('foo_D'); }).done(function(val) {
        expect(val).toEqual('foo_D');
      }).always(done);
    });

    it('should read a value passed from a function-resolving promise', function(done) {
      utils.value(utils.resolve(function() { return 'foo_E'; })).done(function(val) {
        expect(val).toEqual('foo_E');
      }).always(done);
    });
  });

  /**
   * utils.timestamp_now
   */
  describe('utils.timestamp_now', function() {
    it('should be a whole number', function() {
      expect(utils.timestamp_now()).toBeWholeNumber();
    });

    it('should be greater than 0', function() {
      expect(utils.timestamp_now()).toBeGreaterThan(0);
    });
  });

  /**
   * utils.runtime
   */
  describe('utils.runtime', function() {
    it('should be a whole number', function() {
      expect(utils.runtime()).toBeWholeNumber();
    });

    it('should be greater than 0', function() {
      expect(utils.runtime()).toBeGreaterThan(-1);
    });
  });

  /**
   * utils.title
   */
  describe('utils.title', function() {
    afterEach(function() {
      utils.title();
    });

    it('should set document.title with existing title correctly', function() {
      utils.title('foo');
      expect(document.title).toEqual('foo - ' + config.title);
    });

    it('should reset document.title when no arguments are passed', function() {
      utils.title();
      expect(document.title).toEqual(config.title);
    });
  });

  /**
   * utils.Buffer
   */
  describe('utils.Buffer', function() {
    it('should have a length of 0 if not specified', function() {
      var b = new utils.Buffer();
      b.buf('foo');
      expect(b.get()).toEqual([]);
    });

    it('should drop values that exceed capacity', function() {
      var b = new utils.Buffer(2);
      b.buf('foo', 'bar', 'razzle', 'dazzle');
      expect(b.get()).toEqual(['razzle', 'dazzle']);
    });

    it('should allow multiple values to be buffered', function() {
      var b = new utils.Buffer(8);
      b.buf('foo', 'bar', 'razzle', 'dazzle');
      expect(b.get()).toEqual(['foo', 'bar', 'razzle', 'dazzle']);
    });

    it('should allow capacity to be changed', function() {
      var b = new utils.Buffer(2);
      b.buf('foo', 'bar');
      b.set_cap(4);
      b.buf('razzle', 'dazzle');
      expect(b.get()).toEqual(['foo', 'bar', 'razzle', 'dazzle']);
    });

    it('should allow contents to be flushed', function() {
      var b = new utils.Buffer(4);
      b.buf('foo', 'bar');
      b.flush();
      b.buf('razzle', 'dazzle');
      expect(b.get()).toEqual(['razzle', 'dazzle']);
    });
  });

});
