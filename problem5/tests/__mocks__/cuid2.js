module.exports = {
  createId: () => 'test-id-123',
  init: () => ({ createId: () => 'test-id-123' }),
  getConstants: () => ({}),
  isCuid: () => true
};
