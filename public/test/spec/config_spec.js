define(['config'],
function(config) {
  'use strict';

  describe('config module', function() {
    it('should allow values to be functions with returns', function() {
      config.option('fn_test', function() { return (1 + 2 + 3) / 4; });
      expect(config.fn_test).toEqual(1.5);
    });

    it('should force booleans to always be or return booleans', function() {
      config.option('foo_test', false);
      config.foo_test = 'Hello'; // something truthy
      expect(config.foo_test).toEqual(true);

      config.option('bar_test', true);
      config.bar_test = function() { return ''; } // return something falsey
      expect(config.bar_test).toEqual(false);
    });
  });

});
