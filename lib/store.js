const crypto = require('crypto');
const { getProduct } = require('./catalog');

function createError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function createOrder(skus) {
  const list = Array.isArray(skus) ? skus : [];
  if (list.length === 0) {
    throw createError(422, 'VALIDATION_ERROR', 'order requires at least one sku');
  }

  const items = [];
  const bySku = new Map();
  for (const raw of list) {
    const sku = String(raw || '');
    const product = getProduct(sku);
    if (!product) {
      throw createError(422, 'UNKNOWN_SKU', `unknown sku: ${sku}`);
    }
    const existing = bySku.get(sku);
    if (existing) {
      existing.qty += 1;
    } else {
      const item = { sku, name: product.name, price: product.price, qty: 1 };
      bySku.set(sku, item);
      items.push(item);
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    orderId: `ord_${crypto.randomUUID()}`,
    status: 'confirmed',
    items,
    total,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createOrder };
