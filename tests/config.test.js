const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig } = require('../lib/config');

test('getConfig defaults the port to 3000 when PORT is unset', () => {
  const config = getConfig({ env: {} });
  assert.equal(config.port, 3000);
});

test('getConfig reads the port from the PORT env var', () => {
  const config = getConfig({ env: { PORT: '4321' } });
  assert.equal(config.port, 4321);
});

test('getConfig defaults the catalog path to null when CATALOG_PATH is unset', () => {
  const config = getConfig({ env: {} });
  assert.equal(config.catalogPath, null);
});

test('getConfig reads the catalog path from the CATALOG_PATH env var', () => {
  const config = getConfig({ env: { CATALOG_PATH: '/data/products.json' } });
  assert.equal(config.catalogPath, '/data/products.json');
});
