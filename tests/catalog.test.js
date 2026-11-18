const test = require('node:test');
const assert = require('node:assert/strict');
const { searchProducts, getProduct, PRODUCTS } = require('../lib/catalog');

test('returns matching products for a name query, case-insensitive', () => {
  const results = searchProducts('milk');
  assert.ok(results.length > 0, 'expected at least one product matching "milk"');
  for (const r of results) {
    assert.ok(r.name.toLowerCase().includes('milk'), `unexpected match: ${r.name}`);
  }
});

test('returns products sorted by relevance score', () => {
  const results = searchProducts('milk whole');
  assert.ok(results.length > 0);
  const first = results[0];
  assert.ok(first.name.toLowerCase().includes('milk'));
});

test('returns empty array for a query with no matches', () => {
  assert.deepEqual(searchProducts('xyzzy-not-a-real-item'), []);
});

test('returns empty array for an empty query', () => {
  assert.deepEqual(searchProducts('   '), []);
});

test('looks up a single product by sku', () => {
  const product = getProduct('milk-whole');
  assert.ok(product);
  assert.equal(product.sku, 'milk-whole');
  assert.equal(product.price, 3.49);
});

test('returns undefined for an unknown sku', () => {
  assert.equal(getProduct('nope-not-real'), undefined);
});

test('catalog is non-empty and every product has sku, name, price', () => {
  assert.ok(Array.isArray(PRODUCTS));
  assert.ok(PRODUCTS.length > 0);
  for (const p of PRODUCTS) {
    assert.ok(p.sku);
    assert.ok(p.name);
    assert.ok(typeof p.price === 'number');
  }
});
