const dcIgnore = require('../index.js');

describe('@deepcode/dcignore package', () => {
  it('exports two strings', () => {
    expect(Object.keys(dcIgnore)).toHaveLength(2);

    expect(dcIgnore).toMatchObject({
      DefaultDCIgnore: expect.any(String),
      CustomDCIgnore: expect.any(String),
    });
  });
});
