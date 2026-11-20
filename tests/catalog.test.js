const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { searchProducts, getProduct, loadCatalog, PRODUCTS } = require('../lib/catalog');

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

test('searches a caller-provided catalog instead of the built-in one', () => {
  const custom = [
    { sku: 'apple-1', name: 'Apple Gala', category: 'produce', price: 2.49, unit: 'lb' },
  ];
  const results = searchProducts('apple', custom);
  assert.equal(results.length, 1);
  assert.equal(results[0].sku, 'apple-1');
});

test('loadCatalog returns the built-in catalog when no path is given', () => {
  const catalog = loadCatalog();
  assert.ok(Array.isArray(catalog));
  assert.equal(catalog.length, PRODUCTS.length);
});

test('loadCatalog reads a JSON catalog file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seniorspeak-catalog-'));
  const file = path.join(dir, 'products.json');
  fs.writeFileSync(file, JSON.stringify([{ sku: 'milk-x', name: 'Milk', category: 'dairy', price: 3.49, unit: 'gallon' }]));
  try {
    const catalog = loadCatalog(file);
    assert.equal(catalog.length, 1);
    assert.equal(catalog[0].sku, 'milk-x');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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
