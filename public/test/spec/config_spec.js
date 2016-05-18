define(['config'],
function(config) {
  'use strict';

  describe('config module', function() {
    it('should set an option', function() {
      config._priv.set_option('__a', 'A');
      expect(config.__a).toEqual('A');
    });

    it('should set an option on a parent', function() {
      config._priv.set_option('__b', {});
      config._priv.set_option('__c', 'C', '__b');
      expect(config.__b.__c).toEqual('C');
    });

    it('should set multiple options', function() {
      config._priv.set_options({
        __d: 'D',
        __e: 'E'
      });

      expect(config.__d).toEqual('D');
      expect(config.__e).toEqual('E');
    });

    it('should set multiple options on a parent', function() {
      config._priv.set_option('__f', {});

      config._priv.set_options({
        __g: 'G',
        __h: 'H'
      }, '__f');

      expect(config.__f.__g).toEqual('G');
      expect(config.__f.__h).toEqual('H');
    });

    it('should not allow properties to be configurable', function() {
      config._priv.set_option('__i', 'I');
      expect(function() { delete config.__i; }).toThrow();
      expect(config.__i).toEqual('I');
    });

    it('should allow values to be functions with returns', function() {
      config._priv.set_option('fn_test', function() { return (1 + 2 + 3) / 4; });
      expect(config.fn_test).toEqual(1.5);
    });

    it('should force booleans to always be or return booleans', function() {
      config._priv.set_option('foo_test', false);
      config.foo_test = 'Hello'; // something truthy
      expect(config.foo_test).toEqual(true);

      config._priv.set_option('bar_test', true);
      config.bar_test = function() {
        return ''; // return something falsey
      };

      expect(config.bar_test).toEqual(false);
    });
  });

});
