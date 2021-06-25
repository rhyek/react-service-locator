import { autoCompare } from './auto-compare';

describe('autocompare', () => {
  it('works', () => {
    expect(autoCompare(1, 1)).toEqual(true);
    expect(autoCompare(1, 2)).toEqual(false);
    expect(autoCompare('ab', 'ab')).toEqual(true);
    expect(autoCompare('ab', 'ba')).toEqual(false);
    expect(autoCompare(null, null)).toEqual(true);
    expect(autoCompare(undefined, undefined)).toEqual(true);
    expect(autoCompare(null, undefined)).toEqual(false);
    expect(autoCompare({ a: 1 }, null)).toEqual(false);
    expect(autoCompare({ a: 1 }, undefined)).toEqual(false);
    expect(autoCompare(null, { a: 1 })).toEqual(false);
    expect(autoCompare(undefined, { a: 1 })).toEqual(false);
  });
});
