function round2(amount) {
  return Math.round((Number(amount) || 0) * 100) / 100;
}

function computeCartTotal(items) {
  const list = Array.isArray(items) ? items : [];
  const sum = list.reduce(
    (total, item) => total + (Number(item && item.price) || 0) * (Number(item && item.qty) || 0),
    0
  );
  return round2(sum);
}

function formatMoney(amount) {
  return `$${round2(Number(amount) || 0).toFixed(2)}`;
}

module.exports = { computeCartTotal, formatMoney, round2 };
