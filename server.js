const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { getConfig } = require('./lib/config');
const { loadCatalog, searchProducts } = require('./lib/catalog');
const { createOrder } = require('./lib/store');
const { scheduleDelivery } = require('./lib/delivery');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use(helmet());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  const config = getConfig();
  const catalog = loadCatalog(config.catalogPath);

  app.get('/api/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const results = searchProducts(q, catalog);
    return res.json({ query: q, results });
  });

  app.post('/api/orders', (req, res) => {
    const body = req.body;
    const skus = body && body.skus;
    if (!Array.isArray(skus)) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'skus must be an array of item codes' },
      });
    }
    const order = createOrder(skus);
    const delivery = scheduleDelivery(order);
    return res.status(201).json({ ...order, delivery });
  });

  app.use((err, req, res, next) => {
    const status = (err && (err.status || err.statusCode)) || 500;
    const isServerError = status >= 500;
    if (isServerError) {
      console.error('request error:', err && err.message);
    }
    const code = isServerError ? 'INTERNAL_ERROR' : (err && err.code) || 'BAD_REQUEST';
    const message = isServerError ? 'internal error' : (err && err.code) || 'bad request';
    return res.status(status).json({ error: { code, message } });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = getConfig().port;
  app.listen(port, () => {
    console.log(`SeniorSpeak Grocery listening on http://localhost:${port}`);
  });
}

module.exports = { createApp };
