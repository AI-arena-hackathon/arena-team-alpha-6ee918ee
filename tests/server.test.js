const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');

function startApp() {
  const app = createApp();
  const server = app.listen(0);
  return new Promise((resolve) => {
    server.on('listening', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

test('GET /health returns ok', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    server.close();
  }
});

test('GET /api/search returns matching products', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/search?q=milk`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.results));
    assert.ok(body.results.length > 0);
  } finally {
    server.close();
  }
});

test('GET /api/search returns empty results for unknown query', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/search?q=xyzzy-nope`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(body.results, []);
  } finally {
    server.close();
  }
});

test('POST /api/orders creates an order and returns a delivery confirmation', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skus: ['milk-whole'] }),
    });
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.status, 'confirmed');
    assert.ok(body.orderId);
    assert.ok(body.delivery);
  } finally {
    server.close();
  }
});

test('POST /api/orders rejects an unknown sku', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skus: ['nope-not-real'] }),
    });
    const body = await res.json();
    assert.equal(res.status, 422);
  } finally {
    server.close();
  }
});

test('POST /api/orders returns a VALIDATION_ERROR for an empty sku list', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skus: [] }),
    });
    const body = await res.json();
    assert.equal(res.status, 422);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  } finally {
    server.close();
  }
});
