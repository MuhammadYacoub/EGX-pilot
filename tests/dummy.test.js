const sum = (a, b) => a + b;

describe('dummy test', () => {
  test('sum adds numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
