const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { searchProducts } = require('./lib/catalog');
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

  app.get('/api/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const results = searchProducts(q);
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
    try {
      const order = createOrder(skus);
      const delivery = scheduleDelivery(order);
      return res.status(201).json({ ...order, delivery });
    } catch (err) {
      if (/unknown sku/i.test(err.message)) {
        return res.status(422).json({ error: { code: 'UNKNOWN_SKU', message: err.message } });
      }
      throw err;
    }
  });

  app.use((err, req, res, next) => {
    const status = err && err.status ? err.status : 500;
    if (status >= 500) {
      console.error('request error:', err && err.message);
    }
    return res.status(status).json({
      error: { code: status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST', message: status >= 500 ? 'internal error' : 'bad request' },
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`SeniorSpeak Grocery listening on http://localhost:${port}`);
  });
}

module.exports = { createApp };
