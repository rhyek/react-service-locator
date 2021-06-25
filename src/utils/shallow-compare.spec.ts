import { shallowCompare } from './shallow-compare';

describe('shallow compare fn', () => {
  describe('objects', () => {
    it('simple', () => {
      expect(shallowCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual(true);
      expect(shallowCompare({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual(false);
    });
    it('complex', () => {
      expect(
        shallowCompare({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } })
      ).toEqual(false);
      const obj = { c: 3 };
      expect(shallowCompare({ a: 1, b: obj }, { a: 1, b: obj })).toEqual(true);
    });
  });
  describe('arrays', () => {
    it('simple', () => {
      expect(shallowCompare([1, 2], [1, 2])).toEqual(true);
      expect(shallowCompare([1, 2], [1, 3])).toEqual(false);
    });
    it('complex', () => {
      expect(shallowCompare([1, { a: 1 }], [1, { a: 1 }])).toEqual(false);
      const obj = { a: 1 };
      expect(shallowCompare([1, obj], [1, obj])).toEqual(true);
    });
  });
});
