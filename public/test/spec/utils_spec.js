define(['utils', 'jquery', 'underscore'],
function(utils, $, _) {
  'use strict';

  // utils.ensure_jquery
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

  // utils.ensure_array
  describe('utils.ensure_array', function() {
    it('should always return an array', function() {
      expect(utils.ensure_array()).toBeAnArray();
      expect(utils.ensure_array(null)).toBeAnArray();
      expect(utils.ensure_array([])).toBeAnArray();
      expect(utils.ensure_array([1,2,3])).toBeAnArray();
      expect(utils.ensure_array(123)).toBeAnArray();
      expect(utils.ensure_array({})).toBeAnArray();
      expect(utils.ensure_array({ 'foo': [] })).toBeAnArray();
    });
  });

});
