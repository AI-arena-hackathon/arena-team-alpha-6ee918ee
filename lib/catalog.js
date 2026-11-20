const fs = require('fs');

const PRODUCTS = [
  { sku: 'milk-whole', name: 'Whole Milk 1 Gallon', category: 'dairy', price: 3.49, unit: 'gallon' },
  { sku: 'milk-2pct', name: '2% Milk 1 Gallon', category: 'dairy', price: 3.29, unit: 'gallon' },
  { sku: 'eggs-dozen', name: 'Large Eggs Dozen', category: 'dairy', price: 3.19, unit: 'dozen' },
  { sku: 'butter-unsalted', name: 'Unsalted Butter 8oz', category: 'dairy', price: 3.59, unit: 'pack' },
  { sku: 'bread-whole-grain', name: 'Whole Wheat Bread', category: 'bakery', price: 2.99, unit: 'loaf' },
  { sku: 'oats-rolled', name: 'Rolled Oats 42oz', category: 'pantry', price: 3.19, unit: 'container' },
  { sku: 'rice-white', name: 'White Rice 2lb', category: 'pantry', price: 2.49, unit: 'bag' },
  { sku: 'pasta-spaghetti', name: 'Spaghetti 16oz', category: 'pantry', price: 1.99, unit: 'pack' },
  { sku: 'cereal-oats', name: 'Oat Cereal 18oz', category: 'pantry', price: 3.59, unit: 'box' },
  { sku: 'bananas', name: 'Bananas 1lb', category: 'produce', price: 1.29, unit: 'lb' },
  { sku: 'apples-gala', name: 'Gala Apples 3lb', category: 'produce', price: 4.19, unit: 'bag' },
  { sku: 'spinach', name: 'Fresh Spinach 5oz', category: 'produce', price: 2.19, unit: 'bag' },
  { sku: 'orange-juice', name: 'Orange Juice 52oz', category: 'beverage', price: 4.49, unit: 'bottle' },
  { sku: 'coffee-ground', name: 'Ground Coffee 12oz', category: 'beverage', price: 7.99, unit: 'bag' },
  { sku: 'chicken-breast', name: 'Chicken Breast 1lb', category: 'meat', price: 5.99, unit: 'pack' },
  { sku: 'ground-turkey', name: 'Ground Turkey 1lb', category: 'meat', price: 4.99, unit: 'pack' },
  { sku: 'tuna-chicken', name: 'Chicken Tuna 5oz', category: 'meat', price: 1.89, unit: 'can' },
  { sku: 'yogurt-greek', name: 'Greek Yogurt 5.3oz', category: 'dairy', price: 1.29, unit: 'cup' },
];

function loadCatalog(path) {
  const catalogPath = path ? String(path).trim() : '';
  if (!catalogPath) return PRODUCTS;
  const parsed = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const list = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.products) ? parsed.products : null);
  if (!list) {
    throw new Error(`catalog file ${catalogPath} must contain a products array`);
  }
  return list.map((p) => ({
    sku: String(p.sku || ''),
    name: String(p.name || ''),
    category: String(p.category || ''),
    price: Number(p.price) || 0,
    unit: String(p.unit || ''),
  }));
}

function searchProducts(query, catalog) {
  const source = Array.isArray(catalog) ? catalog : PRODUCTS;
  const terms = String(query == null ? '' : query)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return [];

  const scored = [];
  for (const product of source) {
    const name = String(product.name || '').toLowerCase();
    const category = String(product.category || '').toLowerCase();
    let score = 0;
    let matchesAll = true;
    for (const term of terms) {
      let termScore = 0;
      if (name.includes(term)) termScore += 5;
      if (category.includes(term)) termScore += 2;
      if (termScore === 0) {
        matchesAll = false;
        break;
      }
      score += termScore;
    }
    if (matchesAll) scored.push({ product, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((r) => r.product);
}

function getProduct(sku, catalog) {
  const source = Array.isArray(catalog) ? catalog : PRODUCTS;
  const key = String(sku || '');
  return source.find((p) => p.sku === key);
}

module.exports = { PRODUCTS, loadCatalog, searchProducts, getProduct };
