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

test('rejects an empty sku list with a validation error status', () => {
  try {
    createOrder([]);
    assert.fail('expected createOrder([]) to throw');
  } catch (err) {
    assert.equal(err.statusCode, 422);
  }
});

test('tags unknown sku errors with an UNKNOWN_SKU code and status', () => {
  try {
    createOrder(['nope-not-real']);
    assert.fail('expected createOrder to throw for an unknown sku');
  } catch (err) {
    assert.equal(err.code, 'UNKNOWN_SKU');
    assert.equal(err.statusCode, 422);
  }
});

test('createOrder returns a line-level total for each item', () => {
  const order = createOrder(['milk-whole']);
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].lineTotal, 3.49);
});

test('createOrder returns a formatted total for senior-facing display', () => {
  const order = createOrder(['milk-whole', 'bread-whole-grain']);
  assert.equal(order.total, 6.48);
  assert.equal(order.totalFormatted, '$6.48');
});
