const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrder } = require('../lib/store');

test('creates an order from a list of skus', () => {
  const order = createOrder(['milk-whole']);
  assert.equal(order.status, 'confirmed');
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].sku, 'milk-whole');
});

test('creates one line item per sku with quantity one', () => {
  const order = createOrder(['milk-whole', 'bread-whole-grain']);
  assert.equal(order.items.length, 2);
  for (const item of order.items) {
    assert.equal(item.qty, 1);
  }
});

test('rejects an unknown sku', () => {
  assert.throws(() => createOrder(['nope-not-real']), /unknown sku/i);
});

test('rejects an empty sku list', () => {
  assert.throws(() => createOrder([]), /at least one/i);
});
